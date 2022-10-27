'use strict';

const rsmg = require('../../../response/rs');

const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const logger = require('../../../config/logger');
const AdrAccount = require('../../../model/adr_account');

exports.showAccount = async function (req, res) {
    try {
        let evvPort = process.env.PORT
        let data = await AdrAccount.findAll({
            raw: true
        });
        logger.debug('sukses...', JSON.stringify(data));
        logger.debug('evvPort', evvPort)
        return res.json(rsmg(data));
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
        return res.json(rsmg(data));
    } catch (e) {
        logger.error('error showAccount...', e);
        return utils.returnErrorFunction(res, 'error showAccount...', e);
    }
};
