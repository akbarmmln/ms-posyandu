const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const AdrActivity = dbConnection.define('activity', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  account_id: Sequelize.STRING,
  group: Sequelize.STRING,
  title: Sequelize.STRING,
  message: Sequelize.STRING,
  page_link: Sequelize.STRING,
  data: Sequelize.STRING,
  created_dt: Sequelize.DATE,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'activity'
});

module.exports = AdrActivity;