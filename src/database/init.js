// const fs = require("fs");
const { Sequelize, Op } = require("sequelize");
const StudentModelInit = require("./models/student");
const CompanyModelInit = require("./models/company");
const PositionModelInit = require("./models/position");
const StudentPOCModelInit = require("./models/StudentPOC");
const UserModelInit = require("./models/user");
const PositionInterestModelInit = require("./models/position_interest");
const { client: RedisExtraClient } = require("./redis");

// Check database credentials
const {
  TNP_PORTAL_CHECK_DB_BEFORE_USE,
  TNP_PORTAL_SYNC_DB,
  TNP_PORTAL_SYNC_DB_FORCE,
  TNP_PORTAL_DB_URL,
} = process.env;

if (!TNP_PORTAL_DB_URL) {
  console.log("Database credentials not provided. Exiting");
  process.exit(1);
}

/**@type {Sequelize}*/ let sequelize;

// Connect to database
try {
  sequelize = new Sequelize(TNP_PORTAL_DB_URL, { logging: false });
} catch (err) {
  console.error("db_init - unable to connect to database: ", err);
}

var ModelMap = {
  Student: StudentModelInit(sequelize),
  Company: CompanyModelInit(sequelize),
  Position: PositionModelInit(sequelize),
  StudentPOC: StudentPOCModelInit(sequelize),
  Users: UserModelInit(sequelize),
  PositionInterest: PositionInterestModelInit(sequelize),
};

ModelMap.Position.belongsTo(ModelMap.Company);
ModelMap.StudentPOC.hasMany(ModelMap.Company);
ModelMap.Student.belongsToMany(ModelMap.Position, {
  through: "studentPosJunc",
});
ModelMap.Position.belongsToMany(ModelMap.Student, {
  through: "studentPosJunc",
});

// Check connection
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.log("Unable to connect to the database:", err);
    process.exit(1);
  }
}

async function init() {
  if (TNP_PORTAL_CHECK_DB_BEFORE_USE == "true") await checkDatabaseConnection();

  if (TNP_PORTAL_SYNC_DB == "true") {
    await sequelize.sync({ force: TNP_PORTAL_SYNC_DB_FORCE == "true" });
    console.log("Database sync complete. Forced: ", TNP_PORTAL_SYNC_DB_FORCE);
  }

  // Delete unverified users
  const destroyedUsers = await ModelMap.Users.destroy({
    where: {
      metaId: null,
      createdAt: {
        [Op.lt]: new Date(Date.now() - 24 * 60 * 60),
      },
    },
  });

  console.log(`db-init: Users destroyed on start-up: `, destroyedUsers);
}

// Graceful shutdown
function shutdown() {
  console.log("Closing DB connection");
  sequelize.close();
  RedisExtraClient.quit();
}

module.exports = { init, ModelMap, sequelize, shutdown };
