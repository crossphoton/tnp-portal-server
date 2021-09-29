const Redis = require("redis");

const client = Redis.createClient({
  db: process.env.TNP_PORTAL_REDIS_EXTRA || 2,
  url: process.env.TNP_PORTAL_REDIS_URL,
});

module.exports = { client };
