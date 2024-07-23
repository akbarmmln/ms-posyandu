const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrVerifikasi = dbConnection.define('adr_verifikasi', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  kk: Sequelize.STRING,
  account_id: Sequelize.STRING,
  is_registered: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_verifikasi'
});

module.exports = adrVerifikasi;