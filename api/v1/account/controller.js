'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const logger = require('../../../config/logger');
const AdrAccount = require('../../../model/adr_account')
const AdrAccountNewModel = require('../../../model/adr_account_v2')
const CryptoJS = require("crypto-js");
const crypto = require('crypto')
const rp = require('request-promise');
const pug = require('pug');
const compiledResetAccountMailTemplate = pug.compileFile(__dirname + '/templates/notif.pug');
const mailer = require('../../../config/mailer');
const jwt = require('jsonwebtoken');
const pdf = require('html-pdf');
const pdfTemplate = require('./pdf/template');
const options = {
    height: "16.54in",
    width: "10.89in",
};
const format = require('../../../config/format');

exports.showAccount = async function (req, res) {
    try {
        let data = await AdrAccount.findAll({
            raw: true
        });
        logger.debug('sukses...', JSON.stringify(data));
        return res.status(200).json(rsmg(data));
    } catch (e) {
        logger.error('error showAccount...', e);
        return utils.returnErrorFunction(res, 'error showAccount...', e);
    }
};

exports.showAccountNewModels = async function (req, res) {
    try {
        const newModel = AdrAccountNewModel.registerModel('adr_account');
        let aa = await newModel.findAll({
            raw: true
        })
        return res.status(200).json(rsmg(aa));
    } catch (e) {
        logger.error('error showAccount...', e);
        return utils.returnErrorFunction(res, 'error showAccount...', e);
    }
};

exports.findAccount = async function (req, res) {
    try {
        let id = req.body.id;
        let data = await AdrAccount.findOne({
            raw: true,
            where: {
                id: id
            }
        });
        if(!data){
            throw '10001'
        }
        logger.debug('sukses...', JSON.stringify(data));
        return res.status(200).json(rsmg(data));
    } catch (e) {
        logger.error('error showAccount...', e);
        return utils.returnErrorFunction(res, 'error showAccount...', e);
    }
};

exports.sendEmail = async function (req, res) {
    try {
        let mailObject = {
            to: ['akbarmmln@gmail.com'],
            subject: 'Ini hanyalah percobaan',
            html: compiledResetAccountMailTemplate({})
        }

        await mailer.sendGridMailer(mailObject);
        logger.debug('Success send email with new reset credentials');

        return res.status(200).json(rsmg());
    } catch (e) {
        logger.error('failed to send email...', e);
        return utils.returnErrorFunction(res, 'failed to send email...', e);
    }
};

exports.cobavabca = async function (req, res) {
    try {
        let request_timestamp = new Date().toISOString().slice(0, 19) + "Z";
        let request_id = uuidv4();
        let client_id = 'BRN-0218-1667893711927';
        let client_secret = 'SK-TE0QH2ImXsKHUPMPYl1r';
        let url = 'https://api-sandbox.doku.com';
        let endpoint = '/bca-virtual-account/v2/payment-code';
        let body = {
            "order": {
                "invoice_number": "INV-20221110-0002",
                "amount": 10000
            },
            "virtual_account_info": {
                "billing_type": "FIX_BILL",
                "expired_time": 60,
                "reusable_status": false,
                "info1": "Merchant Demo Store",
                "info2": "Thank you for shopping",
                "info3": "on our store"
            },
            "customer": {
                "name": "Akbarmmln",
                "email": "akbarmmln@gmail.com"
            }
        }
        let signature = await createSignature(request_id, client_id, client_secret, request_timestamp, endpoint, body)
        let responVA = await rp({
            method: 'POST',
            uri: url + endpoint,
            headers: {
                'Client-Id': client_id,
                'Request-Id': request_id,
                'Request-Timestamp': request_timestamp,
                'Signature': 'HMACSHA256=' + signature,
                'Request-Target': endpoint
            },
            body: body,
            json: true
        })
        return res.status(200).json(rsmg(responVA))
    } catch (e) {
        logger.error('error coba...', e);
        return utils.returnErrorFunction(res, 'error coba...', e);
    }
};

exports.cobacheckout = async function (req, res) {
    try {
        let request_timestamp = new Date().toISOString().slice(0, 19) + "Z";
        let request_id = uuidv4();
        let client_id = 'BRN-0218-1667893711927';
        let client_secret = 'SK-TE0QH2ImXsKHUPMPYl1r';
        let url = 'https://api-sandbox.doku.com';
        let endpoint = '/checkout/v1/payment';
        let body = {
            "order": {
                "amount": 40000,
                "invoice_number": "INV-20210124-0009",
                "currency": "IDR",
                "callback_url": "http://doku.com/",
                "language": "EN",
                "auto_redirect": true,
                "disable_retry_payment": true,
                "line_items": [
                    {
                        "name": "produk",
                        "quantity": 1,
                        "price": 40000
                    }
                ]
            },
            "payment": {
                "payment_due_date": 60,
                // "payment_method_types": [
                //     "VIRTUAL_ACCOUNT_BCA",
                //     "VIRTUAL_ACCOUNT_BANK_MANDIRI",
                //     "VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI",
                //     "VIRTUAL_ACCOUNT_DOKU",
                //     "VIRTUAL_ACCOUNT_BRI",
                //     "VIRTUAL_ACCOUNT_BNI",
                //     "VIRTUAL_ACCOUNT_BANK_PERMATA",
                //     "VIRTUAL_ACCOUNT_BANK_CIMB",
                //     "VIRTUAL_ACCOUNT_BANK_DANAMON",
                //     "DIRECT_DEBIT_BRI",
                //     "EMONEY_SHOPEEPAY",
                //     "EMONEY_OVO",
                // ]
            },
            "customer": {
                "id": "JC-01",
                "name": "Akbar Mmln",
                "phone": "089687607093",
                "email": "akbarmmln@gmail.com",
                "address": "taman setiabudi",
                "postcode": "120129",
                "state": "Jakarta",
                "city": "Jakarta Selatan",
                "country": "ID"
            },
            "shipping_address": {
                "first_name": "Akbar",
                "last_name": "Mmln",
                "address": "Jalan Teknologi Indonesia No. 25",
                "city": "Jakarta",
                "postal_code": "12960",
                "phone": "081513114262",
                "country_code": "IDN"
            }
        }
        let signature = await createSignature(request_id, client_id, client_secret, request_timestamp, endpoint, body)
        let responVA = await rp({
            method: 'POST',
            uri: url + endpoint,
            headers: {
                'Client-Id': client_id,
                'Request-Id': request_id,
                'Request-Timestamp': request_timestamp,
                'Signature': 'HMACSHA256=' + signature,
                'Request-Target': endpoint
            },
            body: body,
            json: true
        })
        return res.status(200).json(rsmg(responVA))
    } catch (e) {
        logger.error('error coba...', e);
        return utils.returnErrorFunction(res, 'error coba...', e);
    }
};

exports.cobaovo = async function (req, res) {
    try {
        let invoice_number = req.body.invoice_number;
        let amount = req.body.amount;
        let ovo_id = req.body.ovo_id;

        let request_timestamp = new Date().toISOString().slice(0, 19) + "Z";
        let request_id = uuidv4();
        let client_id = 'BRN-0218-1667893711927';
        let client_secret = 'SK-TE0QH2ImXsKHUPMPYl1r';
        let url = 'https://api-sandbox.doku.com';
        let endpoint = '/ovo-emoney/v1/payment';

        let body = {
            "client": {
                "id": client_id
            },
            "order": {
                "invoice_number": invoice_number,
                "amount": parseInt(amount)
            },
            "ovo_info": {
                "ovo_id": ovo_id
            },
            "security": {
                "check_sum": ''
            }
        }
        let str = `${body.order.amount}${client_id}${body.order.invoice_number}${body.ovo_info.ovo_id}${client_secret}`
        let check_sum = crypto.createHash('sha256').update(str).digest('hex');
        body.security.check_sum = check_sum;

        let signature = await createSignature(request_id, client_id, client_secret, request_timestamp, endpoint, body)
        let allPayload = {
            method: 'POST',
            uri: url + endpoint,
            headers: {
                'Client-Id': client_id,
                'Request-Id': request_id,
                'Request-Timestamp': request_timestamp,
                'Signature': 'HMACSHA256=' + signature,
                'Request-Target': endpoint
            },
            body: body,
            json: true
        }
        logger.debug('payload send to ovo...', JSON.stringify(allPayload))
        let responVA = await rp(allPayload)
        logger.debug('payload respon from ovo...', JSON.stringify(responVA))
        return res.status(200).json(rsmg(responVA))
    } catch (e) {
        logger.error('error coba...', e);
        return utils.returnErrorFunction(res, 'error coba...', e);
    }
};

async function createSignature(request_id, client_id, client_secret, request_timestamp, endpoint, body) {
    let bodySha256 = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(JSON.stringify(body)));
    let signatureComponents =
        "Client-Id:" + client_id + "\n"
        + "Request-Id:" + request_id + "\n"
        + "Request-Timestamp:" + request_timestamp + "\n"
        + "Request-Target:" + endpoint + "\n"
        + "Digest:" + bodySha256;
    let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signatureComponents, client_secret));
    return signature;
}

async function randomInvoice(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.token = async function (req, res) {
    try {
        const newToken = await jwt.sign(
            {
                mobileNumber: '08159112320',
                id: '8d49506f-cd14-406b-8d22-77035b7fa738',
                deviceId: 'f58be361-835c-4772-a066-b84bc6f1777a',
            },
            '4b&%RM@uQjGgVczNM6rH3@DpIejV7Y3d'
        );
  
        return res.status(200).json(rsmg(newToken))
    } catch (e) {
        logger.error('error token...', e);
        return utils.returnErrorFunction(res, 'error token...', e);
    }
};

exports.createpdf = async function (req, res) {
    try {
        let html = await pdfTemplate.getHTML();
        pdf.create(html, options).toBuffer(function (err, buffer) {
            if (err) {
                req.filename = null
                logger.debug('error toBuffer pdf...', err)
            }else{
                req.filename = buffer;
            }
            return next();
        });            
    } catch (e) {
        logger.error('error create PDF...', e);
        return utils.returnErrorFunction(res, 'error create PDF...', e);
    }
};

exports.receivedpdf = async function (req, res) {
    try {
        logger.debug('received PDF to Client');
        res.set('responseType: blob');
        let buff = req.filename;
        if(await format.isEmpty(buff)){
            throw '10002'
        }
        let sendFile = req.filename.toString('base64');
        res.send(sendFile);
    } catch (e) {
        logger.error('error received PDF...', e);
        return utils.returnErrorFunction(res, 'error received PDF...', e.toString());
    }
};