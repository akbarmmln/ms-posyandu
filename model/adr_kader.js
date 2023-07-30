const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrKader = dbConnection.define('kader', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  nama: Sequelize.STRING,
  nik: Sequelize.STRING,
  password: Sequelize.STRING,
  umur: Sequelize.STRING,
  alamat: Sequelize.STRING,
  tanggal_lahir: Sequelize.DATE,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'kader'
});

module.exports = AdrKader;