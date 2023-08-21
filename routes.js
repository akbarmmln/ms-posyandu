const express = require('express');
const router = express.Router();
const fs = require('fs');
const location = (name = '') => name ? `api/v1/${name}` : 'api/v1';
const locationv2 = (name = '') => name ? `api/v2/${name}` : 'api/v2';
const logger = require('./config/logger');

/* SET CORS HEADERS FOR API */
router.all('/api/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
})

fs.readdirSync(location())
.forEach(file => {
    const path = `/${location(file)}`;
    logger.debug('location1',path)
    router.use(path, require(`.${path}`));
});

fs.readdirSync(locationv2())
.forEach(file => {
    const path = `/${locationv2(file)}`;
    logger.debug('location2',path)
    router.use(path, require(`.${path}`));
});

module.exports = router;