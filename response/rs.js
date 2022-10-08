const moment = require('moment');

function rs(data) {
  return {
    message: 'success',
    data: data,
    language: 'EN',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS')
  }
}

module.exports = rs;