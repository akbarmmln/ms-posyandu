'use strict';

const rsmg = require('../../../response/rs');

const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const logger = require('../../../config/logger');
const AdrAccount = require('../../../model/adr_account');

exports.showAccount = async function (req, res) {
    try {
        let data = await AdrAccount.findAll({
            raw: true
        });
        logger.debug('sukses...', JSON.stringify(data));
        return res.json(rsmg(data));
    } catch (e) {
        logger.error('error showAccount...', e);
        return utils.returnErrorFunction(res, 'error showAccount...', e);
    }
};