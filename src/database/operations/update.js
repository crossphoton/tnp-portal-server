const { sequelize } = require("../init");

const updateUser = async function (
  /** @type {Object.<string, any>} */ change,
  /** @type {Object.<string, any>} */ filter
) {
  return sequelize.model("users").update(change, { where: filter });
};

const updateCompany = async function (
  /** @type {Object.<string, any>} */ change,
  /** @type {Object.<string, any>} */ filter
) {
  return sequelize.model("company").update(change, { where: filter });
};

const updatePosition = async function (
  /** @type {Object.<string, any>} */ change,
  /** @type {Object.<string, any>} */ filter
) {
  return sequelize.model("position").update(change, { where: filter });
};

const updateStudent = async function (
  /** @type {Object.<string, any>} */ change,
  /** @type {Object.<string, any>} */ filter
) {
  return sequelize.model("student").update(change, { where: filter });
};

const enrollStudentForPosition = async function (
  /** @type {Object.<string, any>} */ student,
  /** @type {Object.<string, any>} */ filter
) {
  let position = await sequelize.model("position").findOne({ where: filter });
  return position.addStudent(student);
};

const update = async (
  /** @type {String} */ model,
  /** @type {Object.<string, any>} */ change,
  /** @type {Object.<string, any>} */ filter
) => {
  return sequelize.model(model).update(change, filter);
};

module.exports = {
  updateUser,
  updateCompany,
  updatePosition,
  updateStudent,
  enrollStudentForPosition,
  update,
};
