const logger = require('../config/logger');
const errMsg = require('../error/resError');
const puppeteer = require('puppeteer');
const wkhtmltopdf = require('wkhtmltopdf');
const crypto = require('node:crypto');
const uuidv4 = require('uuid').v4;
const jwt = require('jsonwebtoken');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  if (typeof errorObject === 'string') {
    logger.error(errorMessageLogger, errorObject);
    return resObject.status(400).json(errMsg(errorObject));
  } else if (errorObject.error) {
    logger.error(errorObject.error.err_code, errorObject);
    return resObject.status(500).json(errorObject.error);
  } else {
    logger.error(errorObject);
    return resObject.status(500).json(errMsg('10000'));
  }
};

exports.generatePDF = async (html, options) => {
  let browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', 'chromium-browser']
  });

  const page = await browser.newPage();
  await page.setContent(html);
  await page.setDefaultNavigationTimeout(0);
  const pdf = await page.pdf({
    width: options.width,
    height: options.height,
    margin: {
      top: options.top,
      bottom: options.bottom,
      left: options.left,
      right: options.right,
    },
    printBackground: false,
    landscape: false,
    pageRanges: '1-1',
  });
  await page.close(); 
  let buf = Buffer.from(pdf, 'base64');
  return buf;
};

exports.generatePDFWKHTML = (html) => {
  wkhtmltopdf.shell = '/bin'
  return new Promise((resolve, reject) => {
    const pdfStream = wkhtmltopdf(html, {
      pageWidth: '6.0in',
      pageHeight: '3.0in',
      marginTop: '0.1in',
      marginRight: '0in',
      marginLeft: '0in',
      marginBottom: '0.1in',
    });
    const pdfBuffer = [];
    pdfStream.on('data', chunk => pdfBuffer.push(chunk));
    pdfStream.on('end', () => resolve(Buffer.concat(pdfBuffer)));
    pdfStream.on('error', err => reject(err));
  });
};

exports.enkrip = async function (payload) {
  try {
    const publickEncrypt = process.env.PUBLIC_KEY_GCM;
    let secretKey = uuidv4();
    secretKey = secretKey.replace(/-/g, "");

    const bodyKey = JSON.stringify(payload);
    const bodyString = bodyKey.replace(/ /gi, '');

    let encs = crypto.publicEncrypt(
      {
        key: publickEncrypt.replace(/\\n/gm, '\n'),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      }, Buffer.from(secretKey));
    encs = encs.toString("base64");

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(bodyString, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      buffer: Buffer.concat([encrypted, tag, iv]).toString('base64'),
      masterKey: encs
    }
  } catch (e) {
    logger.error('error function enkrip...', e);
    throw e
  }
}

exports.signin = async function (hash) {
  try {
    const secret = require('../setting').secret;
    const privateKey = process.env.PRIVATE_KEY_JWT;

    const options = {
      issuer: 'daruku',
      algorithm: 'RS256'
    };
    const token = jwt.sign(
      hash,
      { key: privateKey.replace(/\\n/gm, '\n'), passphrase: secret },
      options,
    );
    return token;
  } catch (e) {
    logger.error('error function signin...', e);
    throw e
  }
}

exports.verify = async function (token) {
  try {
    const publicKey = process.env.PUBLIC_KEY_JWT;

    const options = {
      issuer: 'adiraku',
      algorithms: ['RS256']
    };

    const userToken = jwt.verify(
      token,
      publicKey.replace(/\\n/gm, '\n'),
      options
    );
    return userToken;
  } catch (e) {
    logger.error('error function verify...', e);
    throw e
  }
}

exports.dekrip = async function (masterkey, data) {
  try {
    const privateDecrypt = process.env.PRIVATE_KEY_GCM;

    let options = {
      key: privateDecrypt.replace(/\\n/gm, '\n'),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    };
    let dcs = crypto.privateDecrypt(options, Buffer.from(masterkey, "base64"));
    dcs = dcs.toString("utf8");

    const bufferData = Buffer.from(data, 'base64');
    const iv = Buffer.from(bufferData.slice(bufferData.length - 12, bufferData.length));
    const tag = Buffer.from(bufferData.slice(bufferData.length - 28, bufferData.length - 12));
    let cipherByte = Buffer.from(bufferData.slice(0, bufferData.length - 28));

    const decipher = crypto.createDecipheriv('aes-256-gcm', dcs, iv);
    decipher.setAuthTag(tag);

    let result = Buffer.concat([decipher.update(cipherByte), decipher.final()]);
    result = JSON.parse(result.toString())
    return result
  } catch (e) {
    logger.error('error function dekrip...', e);
    throw e
  }
}