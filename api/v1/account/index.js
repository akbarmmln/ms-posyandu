const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/show-account', controller.showAccount);

module.exports = router;