const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const axios = require("axios").default;

const databaseOperationsRead = require("../src/database/operations/read"),
  databaseOperationsCreate = require("../src/database/operations/create"),
  databaseOperationsUpdate = require("../src/database/operations/update");

const dbOps = require("../src/database/operations");
const {
  createSession,
  deleteSession,
  deleteAllSessions,
} = require("../src/users/session");
const { newProfile } = require("../src/users/newuser");
const {
  sendVerificationEmail,
  passwordChangeEmail,
} = require("../src/utils/email");
const { recaptchaMiddleware } = require("../src/utils/recaptcha");
const changePassword = require("../src/users/changepassword");
const { verifyToken } = require("../src/users/emailVerification");
const storage = require("../src/storage");
const checker = require("../src/utils/checker");
const successHTML = require("../src/utils/emailTemplates/success");
const errorHTML = require("../src/utils/emailTemplates/fail");

const {
  TNP_PORTAL_SALT_ROUNDS,
  TNP_PORTAL_SESSION_LENGTH,
  TNP_PORTAL_PASS_MIN_LENGTH,
} = process.env;

// Create login endpoint
userRouter.post("/login", recaptchaMiddleware, async (req, res) => {
  if (req.user) {
    return res.json(req.user);
  }

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: "invalid body" });

  try {
    let foundUser = await databaseOperationsRead.getUserWithUsername(
      String(username)
    );

    if (foundUser) {
      let compare = await bcrypt.compare(
        String(password),
        foundUser.getDataValue("password")
      );
      if (compare) {
        req.user = {
          username,
          type: foundUser.getDataValue("type"),
          avatar: foundUser.getDataValue("avatar"),
          email: foundUser.getDataValue("email"),
          emailVerified: foundUser.getDataValue("emailVerified"),
        };

        req.user.expiry =
          Date.now() + (TNP_PORTAL_SESSION_LENGTH || 3 * 60 * 60);
        req.user.token = createSession(req.user);
        res.json(req.user);
      } else {
        return res.status(401).json({ msg: "Invalid Password" });
      }
    } else {
      return res.status(401).json({ msg: "No user found with given username" });
    }
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({ msg: `server error: ${err.message}` });
  }
});

userRouter.get("/logout", (req, res) => {
  try {
    if (req.token) deleteSession(req.token);
    res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ msg: `server error: ${err.message}` }); // TODO
  }
});

userRouter.get("/me", (req, res) => {
  if (req.user) res.status(200).json(req.user);
  else res.sendStatus(204);
});

userRouter.post(
  "/signup",
  recaptchaMiddleware,
  async (req, res, next) => {
    if (req.user) {
      return res.status(400).json({ msg: "user already provided" });
    }

    let { email, username, password, type, avatar } = req.body;
    if (
      !email ||
      !username ||
      !password ||
      !type ||
      /* TODO: temporary */ type !== "COMPANY" ||
      String(password).length < (TNP_PORTAL_PASS_MIN_LENGTH || 8)
    )
      /* TODO: will change after validator  */
      return res.status(400).json({
        msg: "Invalid body data",
      });
    if (String(email).match(/[\s\S]*@.+@iiitr\.ac\.in/))
      return res.status(400).json({ msg: "@iiitr.ac.in emails can't be used" });

    // Saving avatar
    let avatarUrl;

    if (avatar && avatar.length > 0) {
      try {
        avatarUrl = await storage.storeAvatar(username, avatar);
      } catch (err) {
        console.error("Error is saving avatar: ", err);
      }
    }

    // Saving user
    try {
      // Forming user to save
      let user = { email, username, type, avatar: avatarUrl };
      user.password = await bcrypt.hash(
        String(password),
        Number(TNP_PORTAL_SALT_ROUNDS) || 10
      );

      let createdUser = await databaseOperationsCreate.createUser(user);
      delete user.password;
      user.avatar = createdUser.getDataValue("avatar");

      user.expiry = Date.now() + (TNP_PORTAL_SESSION_LENGTH || 3 * 60 * 60);
      user.token = createSession(user);
      req.user = user;
      newProfile(createdUser.getDataValue("id"));
      res.json(user);
      next();
    } catch (err) {
      if (err.errors)
        return res.status(400).json({ msg: err.errors[0].message });
      console.log("error: ", err.message);
      return res.sendStatus(500);
    }
  },
  sendVerificationEmail
);

userRouter.get("/verify/:id", async (req, res) => {
  let token = req.params.id;
  const payload = verifyToken(token);
  if (!payload) {
    res.set("Content-type", "text/html");
    return res.status(500).send(errorHTML());
  }

  databaseOperationsUpdate
    .updateUser({ emailVerified: true }, { email: payload.email })
    .then(() => {
      res.set("Content-type", "text/html");
      res.status(200).send(successHTML());
    })
    .catch((err) => {
      res.set("Content-type", "text/html");
      return res.status(500).send(errorHTML());
    });
});

// Student signup with Google Oauth Access Token
userRouter.post(
  "/signup/studentwithgoogle",
  recaptchaMiddleware,
  (req, res) => {
    if (req.user) {
      return res.status(400).json({ msg: "user already provided" });
    }
    const {
      access_token,
      password,
      department,
      year,
      phone,
      address,
      cgpa,
      semTillCGPA,
      resume,
    } = req.body;

    if (
      !access_token ||
      !password ||
      !department ||
      !year ||
      !phone ||
      !address ||
      !cgpa ||
      !semTillCGPA ||
      !resume ||
      String(password).length < (Number(TNP_PORTAL_PASS_MIN_LENGTH) || 8)
    ) {
      /* TODO: will change after validator  */
      return res.status(400).json({ msg: "Invalid body data" });
    }

    axios
      .get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(async (response) => {
        if (response.status !== 200) {
          return res.status(401).send("Invalid access_token");
        }
        const {
          email,
          picture: avatar,
          given_name: fName,
          family_name: lName,
          verified_email: emailVerified,
        } = response.data;

        // Saving resume
        let resumeUrl;

        if (resume && resume.length > 0) {
          try {
            resumeUrl = await storage.storeResume(
              String(email.split("@")[0]).toUpperCase(),
              resume
            );
          } catch (err) {
            console.error("Error in saving resume: ", err);
          }
        }

        // Forming user to save
        try {
          const student = {
            fName,
            lName,
            email,
            roll: email.split("@")[0],
            department,
            year,
            phone,
            address,
            cgpa,
            semTillCGPA,
            resume: resumeUrl,
          };

          const createdStudent = await databaseOperationsCreate.createStudent(
            student
          );

          // Creating user for student
          const studentID = createdStudent.getDataValue("id");
          const user = {
            username: String(email.split("@")[0]).toUpperCase(),
            email,
            emailVerified,
            type: "STUDENT",
            avatar,
            metaId: studentID,
          };
          user.password = await bcrypt.hash(
            password,
            Number(TNP_PORTAL_SALT_ROUNDS) || 10
          );
          await databaseOperationsCreate.createUser(user);

          delete user.password;
          user.expiry = Date.now() + (TNP_PORTAL_SESSION_LENGTH || 3 * 60 * 60);
          const token = createSession(user);
          user.token = token;

          res.json(user);
        } catch (err) {
          if (err.errors)
            return res.status(400).json({ msg: err.errors[0].message });
          console.log("error: ", err.message);
          return res.status(500).json({ msg: `server error: ${err.message}` }); // TODO
        }
      })
      .catch(async (err) => {
        return res
          .status(401)
          .json({ msg: "Invalid Google Access Token. Contact Admin" });
      });
  }
);

userRouter.get("/profileExists", checker({ checkMetaId: true }), (req, res) =>
  res.sendStatus(200)
);

userRouter.put(
  "/avatar",
  checker({ checkAuthorized: true }),
  async (req, res) => {
    let { username } = req.user,
      { avatar } = req.body;

    // Saving resume
    let avatarUrl;

    if (avatar && avatar.length > 0) {
      try {
        avatarUrl = await storage.storeAvatar(username, avatar);
        await dbOps.update.updateUser({ avatar: avatarUrl }, { username });
        return res.sendStatus(204);
      } catch (err) {
        console.error("error in saving resume: ", err);
        return res.status(500).json({ msg: `server error: ${err.message}` });
      }
    }
  }
);

userRouter.post("/changePassword", recaptchaMiddleware, async (req, res) => {
  const { password, method, email, baseUrl } = req.body;
  if (!method) return res.status(400).json({ msg: "Method not specified" });

  let payload;
  if (method == "password") {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    if (!password)
      return res.status(405).json({ msg: "Old password required" });

    const user = await dbOps.read.getUserWithUsername(req.user.username);
    user.getDataValue("password");

    const passMatch = await bcrypt.compare(
      password,
      user.getDataValue("password")
    );
    if (!passMatch) return res.status(401).json({ msg: "Invalid Password" });
    payload = req.user;
  }

  if (method == "email") {
    if (!email && !baseUrl)
      return res.status(405).json({ msg: "Email is required" });
    payload = { email };
  }

  const token = changePassword.createForgotPasswordKey(payload);

  if (method == "email") {
    let url = new URL(baseUrl);
    url.searchParams.append("token", token.token);
    passwordChangeEmail(url.toString(), email);
    return res.sendStatus(204);
  }

  if (method == "password") {
    return res.json({ token });
  }
});

userRouter.post("/resetPassword", async (req, res) => {
  const { token, password } = req.body;
  if (
    !token ||
    !password ||
    String(password).length < (TNP_PORTAL_PASS_MIN_LENGTH || 8)
  )
    return res.status(400).json({ msg: "Password too short" });
  const payload = changePassword.checkForgotPasswordKey(token);
  if (!payload)
    return res.status(400).json({ msg: "Token is invalid, used or expired." });
  try {
    const { email } = payload;
    const hashedPass = await bcrypt.hash(
      String(password),
      Number(TNP_PORTAL_SALT_ROUNDS) || 10
    );
    await dbOps.update.updateUser({ password: hashedPass }, { email });
    deleteAllSessions(req.user);
    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ msg: `server error: ${err.message}` });
  }
});

module.exports = userRouter;
