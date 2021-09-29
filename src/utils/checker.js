/**
 * Middleware to check stuff (roles as of now)
 */

const dbOps = require("../database/operations");
const constants = require("../constants");

const Express = require("express");

/**
 * @typedef {Object} CheckerOptions
 * @property {Array.<String>} [roles]
 * @property {Boolean} [checkAuthorized]
 * @property {Boolean} [checkMetaId]
 * @property {Boolean} [checkEmailVerified]
 * @property {Boolean} [checkVerified]
 */

/**
 * Returns a express middleware with given configuration
 *
 * Order is Authorized > Role > Email Verified > MetaId Present > Profile verified
 */
const checker = (/** @type {CheckerOptions} */ Options) => {
  /* !!!  Order matters here. Don't disturb unnecessarily  !!! */
  if (Options.roles) Options.checkAuthorized = true;
  if (Options.checkVerified) Options.checkMetaId = true;
  if (Options.checkMetaId) Options.checkEmailVerified = true;
  if (Options.checkEmailVerified) Options.checkAuthorized = true;

  return async (
    /** @type {Express.Request} */ req,
    /** @type {Express.Response} */ res,
    /** @type {Express.NextFunction} */ next
  ) => {
    // Check if the user is authorized
    if (Options.checkAuthorized && !req.user)
      return res
        .status(401)
        .json({ msg: "User not logged in or session expired." });

    // Check if the user has the required role
    if (Options.roles && Options.roles.indexOf(req.user.type) == -1)
      return res
        .status(405)
        .json({ msg: "Method not allowed for current user" });

    let user;
    // Check if the user has the email verified
    if (Options.checkEmailVerified) {
      user = await dbOps.read.getUserWithUsername(req.user.username);
      req.user.metaId = user.getDataValue(constants.META_ID_ATTRIBUTE);
      req.User = user;
      if (!user.getDataValue(constants.VERIFIED_EMAIL_ATTRIBUTE))
        return res
          .status(405)
          .json({ msg: "Method not allowed. Verify your email first." });
    }

    // Check if the user has meta id
    if (Options.checkMetaId && !user.getDataValue(constants.META_ID_ATTRIBUTE))
      return res
        .status(405)
        .json({ msg: "Method not allowed. Profile not found." });

    // Check if the user has profile verified
    if (Options.checkVerified) {
      profile = await dbOps.read.get(
        constants.ROLE_TO_MODEL[req.user.type],
        { id: req.user.metaId },
        ["verified"]
      );
      if (!profile.getDataValue(constants.VERIFIED_ATTRIBUTE))
        return res.status(405).json({
          msg: "Method not allowed. Your profile is not verified. If this is unexpected contact admin.",
        });
    }

    if (next) next();
  };
};

module.exports = checker;
