const { DataTypes, Sequelize } = require("sequelize");

module.exports = (/** @type {Sequelize} */ sequelize) => {
  return sequelize.define(
    "company",
    {
      id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      website: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      mainPOCName: { type: DataTypes.STRING, allowNull: false },
      mainPOCPhone: { type: DataTypes.STRING, allowNull: false },
      mainPOCEmail: { type: DataTypes.STRING, allowNull: false },
      mainPOCPosition: { type: DataTypes.STRING, allowNull: true },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      indexes: [{ name: "idx_company_name", fields: ["name"] }],
      deletedAt: true,
    }
  );
};
