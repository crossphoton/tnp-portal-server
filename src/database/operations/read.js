const { sequelize } = require("../init");
const { Op } = require("sequelize");

const getStudent = async function (
  /** @type {Object.<string, any>} */ student,
  /** @type {Array.<string>} */ attributes
) {
  if (student == undefined) return;
  return sequelize.model("student").findOne({ attributes, where: student });
};

const getCompany = async function (
  /** @type {Object.<string, any>} */ company,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("company").findOne({ attributes, where: company });
};

const getAllCompany = async function (
  /** @type {Object.<string, any>} */ company,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("company").findAll({ attributes, where: company });
};

const getPosition = async function (
  /** @type {Object.<string, any>} */ position,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("position").findOne({ attributes, where: position });
};

const getAllPositions = async function (
  /** @type {Object.<string, any>} */ filter,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("position").findAll({ attributes, where: filter });
};

const getStudentPOC = async function (
  /** @type {Object.<string, any>} */ poc,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("student_poc").findOne({ attributes, where: poc });
};

const getUser = async function (
  /** @type {Object.<string, any>} */ user,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("users").findOne({ attributes, where: user });
};

const getPositionsWithCGPA = async function (
  /** @type {Number} */ cgpa,
  /** @type {Integer} */ year,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("position").findAll({
    attributes,
    where: { minCGPA: { [Op.lte]: cgpa }, forBatch: year, status: "OPEN" },
  });
};

const getUserWithUsername = async function (
  /** @type {string} */ username,
  /** @type {Array.<string>} */ attributes
) {
  return sequelize.model("users").findOne({
    attributes,
    where: { username: username },
  });
};

const getPositionsForStudent = async function (
  //TODO
  /** @type {Object.<string, any>} */ student,
  /** @type {Array.<string>} */ attributes
) {
  if (!student) return;
  const studentObject = await getStudent(student);
  return getPositionsWithCGPA(
    studentObject.cgpa,
    studentObject.year,
    attributes
  );
};

const get = async (
  /** @type {String} */ model,
  /** @type {Object.<string, any>} */ filter,
  /** @type {Array.<string>} */ attributes
) => {
  return sequelize.model(model).findOne({ where: filter, attributes });
};

const getEnrollPositions = async function (
  /** @type {Object.<string, any>} */ filter
) {
  let student = await sequelize.model("student").findOne({ where: filter });
  return student.getPositions();
};

const getEnrollStudents = async function (
  /** @type {Object.<string, any>} */ filter
) {
  let position = await sequelize.model("position").findOne({ where: filter });
  return position.getStudents();
};

module.exports = {
  getStudent,
  getCompany,
  getAllCompany,
  getPosition,
  getAllPositions,
  getStudentPOC,
  getUser,
  getPositionsWithCGPA,
  getUserWithUsername,
  getPositionsForStudent,
  get,
  getEnrollPositions,
  getEnrollStudents,
};
