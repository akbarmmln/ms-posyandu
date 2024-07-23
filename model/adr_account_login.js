const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrAccountLoginModel = (partition) => {
	return dbConnection.define(`adr_account_login_${partition}`, {
		id: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		created_dt: Sequelize.DATE(6),
		created_by: Sequelize.STRING,
		modified_dt: Sequelize.DATE(6),
		modified_by: Sequelize.STRING,
		is_deleted: Sequelize.INTEGER,
		account_id: Sequelize.STRING,
		pin: Sequelize.STRING,
		available_counter: Sequelize.STRING,
		next_available: Sequelize.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
		tableName: `adr_account_login_${partition}`,	
	});
};

module.exports = adrAccountLoginModel