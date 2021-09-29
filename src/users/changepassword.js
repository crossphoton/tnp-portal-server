const JWT = require("jsonwebtoken");

var blackList = [];

const createForgotPasswordKey = (/** @type {any} */ payload) => {
  const token = JWT.sign(payload, process.env.TNP_PORTAL_JWT_SECRET, {
    expiresIn: 60 * 10,
  });

  return { token, expiry: Date.now() + 60 * 10 };
};

const checkForgotPasswordKey = (/** @type {String} */ token) => {
  const found = blackList.indexOf(token);
  if (found !== -1) return null;
  try {
    const payload = JWT.verify(token, process.env.TNP_PORTAL_JWT_SECRET);
    blackList.push(token);
    return payload;
  } catch (e) {
    return null;
  }
};

module.exports = { createForgotPasswordKey, checkForgotPasswordKey };
