'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const mqttConfig = require('./api/v1/healthcek/controller');

// Constants
let PORT = process.env.PORT

const server = app.listen(PORT, () => logger.debug(`API Server started. Listening on port:${PORT}`));
mqttConfig.mqtt();

module.exports = server;