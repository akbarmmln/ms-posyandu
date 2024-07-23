const moment = require('moment');
const errCode = require('../error/errCode');

function rs(code, data) {
  let code_description;
  if (code == '000000') {
    code_description = 'success'
  } else {
    code_description = errCode[code];
    data = null
  }

  return {
    message: 'success',
    code: code,
    code_description: code_description,
    data: data,
    language: 'EN',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS')
  }
}

module.exports = rs;