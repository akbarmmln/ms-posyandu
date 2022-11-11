'use strict';

const utils = require('../utils/utils');
const logger = require('./logger');
const settings = require('../setting').email;

exports.sendGridMailer = async function (mailObject) {
  try {
    mailObject.from = 'noreplaay@emfrst.co.id';
    return utils.sendGridMailer(settings.hostname, settings.username, settings.password, settings.port, mailObject.from, mailObject.to, mailObject.subject, mailObject.html, mailObject.attachments);
  } catch (e) {
    logger.error('failed to send email', e.toString());
    throw e;
  }
}