const express = require("express");
const Redis = require("redis");
const { v4: UUIDv4 } = require("uuid");

/** @type {Redis.RedisClient} */ let sessionRedis;
const SESSION_DB = process.env.TNP_PORTAL_REDIS_SESSION_DB || 0;

function init() {
  try {
    sessionRedis = Redis.createClient({
      db: SESSION_DB,
      url: process.env.TNP_PORTAL_REDIS_URL,
    });
    console.log("session - connected to redis");
  } catch (err) {
    console.error("session - unable to connect to redis: ", err);
  }
}

/**
 * Middleware to set user in req if token is provided (RESULT = res.user)
 */
const checkAndSetUser = (
  /** @type {express.Request} */ req,
  /** @type {express.Response} */ res,
  /** @type {express.NextFunction} */ next
) => {
  let token = req.query.token;
  if (!token && req.get("Authorization"))
    token = req.get("Authorization").substr(String("Bearer ").length);

  if (token) {
    req.token = token;
    sessionRedis.get(token, (err, reply) => {
      if (err) return res.sendStatus(500); // TODO
      if (reply) req.user = JSON.parse(reply);
      next();
    });
  } else next();
};

/**
 * Create session and store in redis with expiry
 */
const createSession = (/** @type {Object.<string, any>} */ user) => {
  user = JSON.stringify(user);
  const token = UUIDv4();
  user.token = token;
  sessionRedis.setex(
    token,
    process.env.TNP_PORTAL_SESSION_LENGTH || /** 3 hours */ 3 * 60 * 60,
    user,
    (err) => {
      if (err) throw err;
    }
  );

  return token;
};

const updateSession = (
  /** @type {string} */ key,
  /** @type {Object.<string, any>} */ user
) => {
  user = JSON.stringify(user);
  sessionRedis.ttl(key, (err, ttl) => {
    if (err) throw err;
    sessionRedis.setex(key, ttl, user, (err) => {
      if (err) throw err;
    });
  });
};

const deleteSession = (/** @type {string} */ key) => {
  sessionRedis.del(key, (err, _s) => {
    if (err) throw err;
  });
};

const deleteAllSessions = (/** @type {Object.<string, any>} */ key) => {
  sessionRedis.del(key, (err, _s) => {
    if (err) throw err;
  });
};

function shutdown() {
  sessionRedis.quit();
}

module.exports = {
  init,
  checkAndSetUser,
  createSession,
  updateSession,
  deleteSession,
  deleteAllSessions,
  shutdown,
};
