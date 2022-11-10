const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/show-account', controller.showAccount);
router.post('/find-account', controller.findAccount);

router.post('/coba-va-bca', controller.cobavabca);
router.post('/coba-checkout', controller.cobacheckout);
router.post('/coba-ovo', controller.cobaovo);

module.exports = router;