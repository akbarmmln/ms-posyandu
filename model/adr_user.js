const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrAccount = dbConnection.define('peserta', {
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
  jenis_kelamin: Sequelize.STRING,
  peserta_posyandu: Sequelize.STRING,
  kartu_keluarga: Sequelize.STRING,
  created_dt: Sequelize.STRING,
  device_id: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'peserta'
});

module.exports = AdrAccount;