const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/show-account', controller.showAccount);
router.post('/find-account', controller.findAccount);

module.exports = router;