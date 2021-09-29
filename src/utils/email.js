const Express = require("express");
const nodemailer = require("nodemailer");
const verifyTemplate = require("./emailTemplates/verify");
const resetPassword = require("./emailTemplates/changePassword");
const { createToken } = require("../users/emailVerification");

const {
  TNP_PORTAL_SMTP_EMAIL,
  TNP_PORTAL_SMTP_PASSWORD,
  TNP_PORTAL_VERIFY_EMAIL,
} = process.env;

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  ignoreTLS: true,
  service: "gmail",
  auth: {
    user: TNP_PORTAL_SMTP_EMAIL,
    pass: TNP_PORTAL_SMTP_PASSWORD,
  },
});

function sendVerificationEmail(
  /** @type {Express.Request} */ req,
  /** @type {Express.Response} */ res,
  /** @type {Express.NextFunction} */ next
) {
  if (TNP_PORTAL_VERIFY_EMAIL != "true") return next();

  const { token } = createToken({ email: req.user.email });

  let verificationUrl = `${req.protocol}://${req.hostname}/users/verify/${token}`;
  if (req.hostname == "localhost")
    verificationUrl = `http://localhost:${process.env.PORT}/users/verify/${token}`;

  var mailOptions = {
    from: `TNP-IIITR<${TNP_PORTAL_SMTP_EMAIL}>`,
    to: req.user.email,
    subject: "Verify your Account",
    html: verifyTemplate(verificationUrl, 1), // TODO: expiry
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
  });
  next();
}

const passwordChangeEmail = (
  /** @type {String} */ url,
  /** @type {String} */ email
) => {
  const mailOptions = {
    from: `TNP-IIITR<${TNP_PORTAL_SMTP_EMAIL}>`,
    html: resetPassword(url, 10), // TODO: expiry time
    to: String(email),
    subject: "Password change request",
  };
  return transporter.sendMail(mailOptions, function (error, _info) {
    if (error) {
      console.error("error sending email: ", error);
    }
  });
};

module.exports = { passwordChangeEmail, sendVerificationEmail };
