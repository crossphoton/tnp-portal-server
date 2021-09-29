const { DataTypes, Sequelize } = require("sequelize");

const UserTypes = ["COMPANY", "STUDENT", "STUDENTPOC", "ADMIN"];

/**
 * User represents login of a user.
 */
module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
      },
      username: { type: DataTypes.STRING, unique: true },
      password: { type: DataTypes.STRING },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "https://avatars0.githubusercontent.com/u/186909",
        allowNull: true,
        validate: { isUrl: true },
      },
      type: { type: DataTypes.STRING, validate: { isIn: [UserTypes] } },
      metaId: { type: DataTypes.UUID, allowNull: true },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // lastLogin: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: Date.now(),
      // },
    },
    {
      timestamps: true,
      freezeTableName: true,
      indexes: [{ name: "idx_name", fields: ["username"] }],
    }
  );
};
