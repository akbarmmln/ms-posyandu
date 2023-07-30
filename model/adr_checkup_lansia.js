const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrCheckupLansia = dbConnection.define('checkup_lansia', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  nama: Sequelize.STRING,
  nik: Sequelize.STRING,
  umur: Sequelize.STRING,
  jenis_kelamin: Sequelize.STRING,
  tgl_periksa: Sequelize.DATE,
  berat_badan: Sequelize.STRING,
  tinggi_badan: Sequelize.STRING,
  tensi_darah: Sequelize.STRING,
  ket_tensi_darah: Sequelize.STRING,
  asam_urat: Sequelize.STRING,
  ket_asam_urat: Sequelize.STRING,
  kolerstrol: Sequelize.STRING,
  ket_kolerstrol: Sequelize.STRING,
  catatan: Sequelize.STRING,
  obat: Sequelize.STRING,
  account_id: Sequelize.STRING,
  tanggal_lahir: Sequelize.DATE,
  rating: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'checkup_lansia'
});

module.exports = AdrCheckupLansia;