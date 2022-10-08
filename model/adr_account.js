const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrAccount = dbConnection.define('adr_account', {
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
  tableName: 'adr_account'
});

module.exports = AdrAccount;