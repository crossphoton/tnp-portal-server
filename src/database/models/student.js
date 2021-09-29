const { DataTypes, Sequelize } = require("sequelize");

const Departments = ["CSE"];

module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "student",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      fName: { type: DataTypes.STRING, allowNull: false },
      lName: { type: DataTypes.STRING },
      roll: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { is: /^[a-z]{2}\d{2}b\d{4}/i },
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [Departments] },
      },
      year: { type: DataTypes.INTEGER, min: 2019 },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING },
      address: { type: DataTypes.STRING },
      cgpa: { type: DataTypes.FLOAT, min: 0, max: 10 },
      semTillCGPA: { type: DataTypes.INTEGER },
      resume: { type: DataTypes.STRING, validate: { isUrl: true } },
      eligibleForPlacement: { type: DataTypes.BOOLEAN, defaultValue: false },
      eligibleForInternship: { type: DataTypes.BOOLEAN, defaultValue: false },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      comment: {
        type: DataTypes.STRING,
      }
    },
    {
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { name: "idx_roll", fields: ["roll"] },
        { name: "idx_fname", fields: ["fName"] },
        { name: "idx_student_name", fields: ["fName", "lName"] },
      ],
      deletedAt: true,
    }
  );
};
