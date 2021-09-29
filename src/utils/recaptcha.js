const axios = require("axios").default;
const Express = require("express");
const qs = require("qs");

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const verifyCaptcha = async (
  /** @type {String}*/ captcha_response,
  /** @type {String} */ remoteip
) => {
  try {
    var data = qs.stringify({
      secret: process.env.RECAPTCHA_SECRET,
      response: captcha_response,
      remoteip: remoteip,
    });
    var config = {
      method: "post",
      url: RECAPTCHA_VERIFY_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    const response = await axios(config);
    return response.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Middleware to verify Recaptcha response.
 */
const recaptchaMiddleware = (
  /** @type {Express.Request} */ req,
  /** @type {Express.Response} */ res,
  /** @type {Express.NextFunction} */ next
) => {
  if (process.env.RECAPTCHA_REQUIRED != "true") return next();

  if (req.body.g_recaptcha) {
    verifyCaptcha(req.body.g_recaptcha, req.ip).then((response) => {
      if (response.success) {
        next();
      } else {
        res.status(403).json({ msg: "Captcha verification failed." });
      }
    });
  } else return res.status(403).json({ msg: "Captcha verification failed." });
};

// Send post request using axios to verify received recaptcha response
module.exports = {
  verifyCaptcha,
  recaptchaMiddleware,
};
