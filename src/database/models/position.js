const { DataTypes, Sequelize } = require("sequelize");

module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "position",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [["INTERNSHIP", "PLACEMENT"]] },
      },
      hires: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      duration: { type: DataTypes.INTEGER, allowNull: true },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Remote",
      },
      companyName: { type: DataTypes.STRING, allowNull: false },
      salary: { type: DataTypes.INTEGER, allowNull: true },
      ppoAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [["OPEN", "CLOSED"]] },
        defaultValue: "CLOSED",
      },
      minCGPA: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      forBatch: { type: DataTypes.INTEGER, allowNull: false },
      pocName: { type: DataTypes.STRING, allowNull: false },
      pocPhone: { type: DataTypes.STRING, allowNull: false },
      pocEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      indexes: [{ name: "idx_position_name", fields: ["name"] }],
      deletedAt: true,
    }
  );
};
