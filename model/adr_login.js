const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrAccount = dbConnection.define('login', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  type: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'login'
});

module.exports = AdrAccount;