const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrFileChunk = dbConnection.define('file_chunk', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  id_file: Sequelize.STRING,
  url_link: Sequelize.STRING,
  created_dt: Sequelize.DATE(6)
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'file_chunk'
});

module.exports = AdrFileChunk;