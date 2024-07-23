const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/send-mail', controller.sendMail);

router.post('/parsing-qris-string', controller.parsingQRString);

router.post('/', controller.getAccount);
router.post('/login', controller.getLogin);
router.post('/register', controller.registerAccount);

module.exports = router;