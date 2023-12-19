const logger = require('../config/logger');
const errMsg = require('../error/resError');
const puppeteer = require('puppeteer');

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
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', 'chromium-browser', 'google-chrome']
  });

  const page = await browser.newPage();
  await page.setContent(html);
  page.setDefaultNavigationTimeout(0);
  const pdf = await page.pdf({
    width: options.width,
    height: options.height,
    printBackground: false,
    landscape: true,
    pageRanges: '1-1',
  });
  let buf = Buffer.from(pdf, 'base64');
  return buf;
};
