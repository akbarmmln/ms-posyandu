const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

exports.registerModel = function (tableName) {
  const AdrAccount = dbConnection.define(tableName, {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    created_dt: Sequelize.DATE,
    created_by: Sequelize.STRING,
    modified_dt: Sequelize.DATE,
    modified_by: Sequelize.STRING,
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING
  }, {
    freezeTableName: true,
    timestamps: false,
    tableName: tableName
  });
  return AdrAccount;
};