const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/show-account', controller.showAccount);
router.post('/show-account-new-model', controller.showAccountNewModels);
router.post('/find-account', controller.findAccount);
router.post('/send-email', controller.sendEmail);

router.post('/coba-va-bca', controller.cobavabca);
router.post('/coba-checkout', controller.cobacheckout);
router.post('/coba-ovo', controller.cobaovo);

module.exports = router;