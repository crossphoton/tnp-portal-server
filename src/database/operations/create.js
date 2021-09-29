const sequelize = require("../init").sequelize;

const createStudent = async function (
  /** @type {Object.<string, any>} */ student
) {
  return sequelize.model("student").create(student);
};

const createCompany = async function (
  /** @type {Object.<string, any>} */ company
) {
  return sequelize.model("company").create(company);
};

const createPosition = async function (
  /** @type {Object.<string, any>} */ position
) {
  return sequelize.model("position").create(position);
};

const createStudentPOC = async function (
  /** @type {Object.<string, any>} */ poc
) {
  return sequelize.model("student_poc").create(poc);
};

const createUser = async function (/** @type {Object.<string, any>} */ user) {
  return sequelize.model("users").create(user);
};

const create = async (
  /** @type {String} */ model,
  /** @type {Object.<string, any>} */ data
) => {
  return sequelize.model(model).create(data);
};

module.exports = {
  createStudent,
  createCompany,
  createPosition,
  createStudentPOC,
  createUser,
  create,
};
