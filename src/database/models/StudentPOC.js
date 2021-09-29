const { DataTypes, Sequelize } = require("sequelize");

const Departments = ["CSE"]; // Departments in Institute

module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "student_poc",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      fName: { type: DataTypes.STRING, allowNull: false },
      lName: { type: DataTypes.STRING },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [Departments] },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      indexes: [{ fields: ["email"], unique: true }],
      deletedAt: true,
    }
  );
};
