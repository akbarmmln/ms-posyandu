const moment = require('moment');
const errCode = require('./errCode');

function resError(code, e) {
  return {
    message: 'unsuccessful',
    err_code: code,
    err_msg: errCode[code],
    err_msg2: e,
    language: 'EN',
    timestamp: moment().format()
  }
}

module.exports = resError;