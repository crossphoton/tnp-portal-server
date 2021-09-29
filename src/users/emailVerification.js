const JWT = require("jsonwebtoken");
var blackList = [];
const JWT_SECRET = process.env.TNP_PORTAL_JWT_SECRET;

const createToken = (/** @type {any} */ payload) => {
  const token = JWT.sign(payload, JWT_SECRET + "email", {
    expiresIn: 60 * 60 * 24,
  });

  return { token, expiry: Date.now() + 60 * 60 * 24 };
};

const verifyToken = (/** @type {String} */ token) => {
  const found = blackList.indexOf(token);
  if (found !== -1) return null;
  try {
    const payload = JWT.verify(token, JWT_SECRET + "email");
    blackList.push(token);
    return payload;
  } catch (e) {
    return null;
  }
};

module.exports = { createToken, verifyToken };
