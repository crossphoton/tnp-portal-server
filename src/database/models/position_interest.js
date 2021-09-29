const { DataTypes, Sequelize } = require("sequelize");

module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "position_interest",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
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
      deletedAt: true,
    }
  );
};
