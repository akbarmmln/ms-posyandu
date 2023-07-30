const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrCheckupBalita = dbConnection.define('checkup_balita', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  nama: Sequelize.STRING,
  nik: Sequelize.STRING,
  umur: Sequelize.STRING,
  tgl_periksa: Sequelize.DATE,
  berat_badan: Sequelize.STRING,
  ket_berat_badan: Sequelize.STRING,
  tinggi_badan: Sequelize.STRING,
  ket_tinggi_badan: Sequelize.STRING,
  lingkar_kepala: Sequelize.STRING,
  ket_lingkar_kepala: Sequelize.STRING,
  jenis_imunisasi: Sequelize.STRING,
  catatan: Sequelize.STRING,
  obat: Sequelize.STRING,
  orang_tua_kandung: Sequelize.STRING,
  account_id: Sequelize.STRING,
  tanggal_lahir: Sequelize.DATE,
  rating: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'checkup_balita'
});

module.exports = AdrCheckupBalita;