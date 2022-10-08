'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
// Constants
let PORT = 8099

const server = app.listen(PORT, () => logger.debug(`API Server started. Listening on port:${PORT}`));

module.exports = server;