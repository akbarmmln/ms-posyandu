const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/list-peserta', controller.list_peserta);

module.exports = router;