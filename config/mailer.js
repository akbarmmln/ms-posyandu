'use strict';

const utils = require('../utils/utils');
const logger = require('./logger');
const settings = require('../setting').email;
const nodemailer = require('nodemailer');

exports.smtpMailer = async function (mailObject) {
  try {
    let hostname = settings.hostname;
    let username = settings.username;
    let password = settings.password;
    let port = settings.port;
    let from = mailObject.from = 'noreplay@emfrst.co.id';
    let to = mailObject.to;
    let subject = mailObject.subject;
    let body = mailObject.html;
    let attachments = mailObject.attachments;

    let transporter = nodemailer.createTransport({
      host: hostname,
      port: port,
      secure: false,
      auth: {
        user: username,
        pass: password
      }
    });
    let sendProps = {
      from: from,
      to: to,
      subject: subject,
      html: body
    };
  
    if(attachments){
      sendProps.attachments = attachments
    }
    let info = await transporter.sendMail(sendProps);
    let hasil = {
      code: 200,
      status: 'sucess',
      message: info
    }
    logger.debug(`success send email, email to ${mailObject.to}`, hasil);
    return hasil;
  } catch (e) {
    let hasil = {
      code: 500,
      status: 'failed',
      message: e.toString()
    }
    logger.error(`failed to send email, email to ${mailObject.to}`, hasil);
    return hasil;
  }
}