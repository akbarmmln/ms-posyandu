const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrCheckupIbuHamil = dbConnection.define('checkup_ibu_hamil', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  nama: Sequelize.STRING,
  nik: Sequelize.STRING,
  nama_suami: Sequelize.STRING,
  usia_hamil: Sequelize.STRING,
  tanggal_periksa: Sequelize.DATE,
  berat_badan: Sequelize.STRING,
  tensi_darah: Sequelize.STRING,
  ket_tensi_darah: Sequelize.STRING,
  lingkar_lengan_atas: Sequelize.STRING,
  ket_lingkar_lengan_atas: Sequelize.STRING,
  denyut_jantung_bayi: Sequelize.STRING,
  ket_denyut_jantung_bayi: Sequelize.STRING,
  catatan: Sequelize.STRING,
  obat: Sequelize.STRING,
  account_id: Sequelize.STRING,
  tinggi_fundus: Sequelize.STRING,
  ket_tinggi_fundus: Sequelize.STRING,
  tanggal_lahir: Sequelize.DATE,
  rating: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'checkup_ibu_hamil'
});

module.exports = AdrCheckupIbuHamil;