const Redis = require("redis");
const databaseOperationsRead = require("../database/operations/read");

/** @type {Redis.RedisClient} */ let profileExpiryRedis;
const PROFILE_EXPIRE_DB = process.env.TNP_PORTAL_REDIS_PROFILE_EXPIRE_DB || 0;

function init() {
  try {
    profileExpiryRedis = Redis.createClient({
      db: PROFILE_EXPIRE_DB,
      url: process.env.TNP_PORTAL_REDIS_URL,
    });
    console.log("newuser - connected to redis");
  } catch (err) {
    console.error("newuser - unable to connect to redis: ", err);
  }

  // Listen for a message from the redis key expiry pubsub channel
  profileExpiryRedis.on("message", async (_channel, message) => {
    let user = await databaseOperationsRead.get("users", { id: message }, [
      "emailVerified",
      "metaId",
    ]);
    if (!user.getDataValue("emailVerified") && !user.getDataValue("metaId")) {
      user.destroy();
    }
  });

  profileExpiryRedis.subscribe(`__keyevent@${PROFILE_EXPIRE_DB}__:expired`);
}

/**
 * Add newly created user for expiration if profile not completed in time.
 *
 * @param {string} userId - id of user created
 */
const newProfile = (/** @type {String} */ userId) => {
  profileExpiryRedis.unsubscribe();
  profileExpiryRedis.setex(userId, /** 1 Day */ 24 * 60 * 60, " "); // TODO: use config for expiry
  profileExpiryRedis.subscribe(`__keyevent@${PROFILE_EXPIRE_DB}__:expired`);
};

const deleteProfileCheck = (/** @type {string} */ userId) => {
  if (!userId) throw new Error("userId not provided");
  profileExpiryRedis.unsubscribe();
  profileExpiryRedis.del(userId);
  profileExpiryRedis.subscribe(`__keyevent@${PROFILE_EXPIRE_DB}__:expired`);
};

function shutdown() {
  profileExpiryRedis.quit();
}

module.exports = {
  newProfile,
  deleteProfileCheck,
  shutdown,
  init,
};
