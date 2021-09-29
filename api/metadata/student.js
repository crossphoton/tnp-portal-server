const studentRouter = require("express").Router();

const checker = require("../../src/utils/checker");
const constants = require("../../src/constants");

const dbOps = require("../../src/database/operations");

studentRouter.get(
  "/",
  checker({ roles: ["STUDENT"], checkEmailVerified: true, checkMetaId: true }),
  (req, res) => {
    let filter = { id: req.user.metaId };

    dbOps.read
      .getStudent(filter, constants.STUDENT_ATTRIBUTED_ALLOWED_TO_GET)
      .then((student) => {
        res.status(200).json(student);
      })
      .catch((err) => {
        console.log("error while getting student data: ", err);
        res.status(500).json({
          msg: "Unable to fetch data. Please Try again after some time",
        });
      });
  }
);

studentRouter.put(
  "/",
  checker({ checkAuthorized: true, roles: ["STUDENT"] }),
  async (req, res) => {
    const { phone, address, cgpa, semTillCGPA, resume } = req.body;

    try {
      const user = await dbOps.read.getUserWithUsername(req.user.username, [
        constants.META_ID_ATTRIBUTE,
      ]);

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

      const changes = {
        phone,
        address,
        cgpa,
        semTillCGPA,
        resume: resumeUrl,
        [constants.VERIFIED_ATTRIBUTE]: false,
      };

      await dbOps.update.updateStudent(changes, {
        id: user.getDataValue(constants.META_ID_ATTRIBUTE),
      });
      return res.sendStatus(204);
    } catch (err) {
      console.error("error in student update: ", err);
      return res.status(500).json({ msg: `server error: ${err.message}` });
    }
  }
);

module.exports = studentRouter;
