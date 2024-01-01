'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const mailer = require('../../../config/mailer');
const mailTemplate = require('./template/mail');

exports.sendMail = async function (req, res) {
  try{
    let mailObject = {
      to: ['akbarmmln@gmail.com'],
      subject: `Download Document`,
      html: await mailTemplate.emailTemplate(),
      attachments: [
        {
          filename: `${moment().format('YYYYMMDDHHmmssSSSS')}.pdf`,
          path: `./stash/dummy.pdf`,
          contentType: 'application/pdf'
        }
      ]
    };
    let resMailer = await mailer.smtpMailer(mailObject);
    logger.debug('result send mail...', JSON.stringify(resMailer));
    return res.status(200).json(rsmg(resMailer))
  }catch(e){
    logger.error('error sendMail...', e);
    return utils.returnErrorFunction(res, 'error sendMail...', e);
  }
}