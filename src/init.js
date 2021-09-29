const database = require("./database/init");
const newuser = require("./users/newuser");
const session = require("./users/session");

const init = () => {
  database.init();
  newuser.init();
  session.init();
};

const shutdown = () => {
  database.shutdown();
  newuser.shutdown();
  session.shutdown();
};

module.exports = { init, shutdown };
