'use strict';

const rsmg = require('../../../response/rs');

const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const logger = require('../../../config/logger');

exports.notifovo = async function (req, res) {
    try {
        logger.debug('payload received for notifovo...', JSON.stringify(req.body), JSON.stringify(req.headers))
        return res.status(200).json(rsmg());
    } catch (e) {
        logger.error('error notif ovo...', e);
        return utils.returnErrorFunction(res, 'error notif ovo...', e);
    }
};

exports.notifva = async function (req, res) {
    try {
        logger.debug('payload received for notifva...', JSON.stringify(req.body), JSON.stringify(req.headers))
        return res.status(200).json(rsmg());
    } catch (e) {
        logger.error('error notif va...', e);
        return utils.returnErrorFunction(res, 'error notif va...', e);
    }
};