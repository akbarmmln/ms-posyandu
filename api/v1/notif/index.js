const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/notif-ovo', controller.notifovo);
router.post('/notif-va', controller.notifva);

module.exports = router;