const { sequelize } = require("../init");

const deletePosition = async function (
  /** @type {Object.<string, any>} */ filter
) {
  return sequelize.model("position").destroy({where:filter});
};

module.exports = {

    deletePosition,
}