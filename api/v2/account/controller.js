'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const logger = require('../../../config/logger');
const user = require('../../../model/adr_user');
const kader = require('../../../model/adr_kader');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const AdrCheckupBalita = require('../../../model/adr_checkup_balitas');
const AdrCheckupLansia = require('../../../model/adr_checkup_lansia');
const sequelize = require('sequelize');
const format = require('../../../config/format');
const AdrCheckupIbuHamil = require('../../../model/adr_checkup_hamil');
const rp = require('request-promise');
const AdrActivity = require('../../../model/adr_activity');
const FileType = require('file-type');
const s3 = require('../../../config/oss').client;
const AdrFileChunk = require('../../../model/adr_file_chunk');
const base64 = require('../../../utils/base64');
const fetch = require('node-fetch');
const errMsg = require('../../../error/resError');

exports.list_peserta = async function (req, res) {
  try{
    let hasil = [];
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let rcount = await user.count({
      raw: true,
      limit: limit,
      offset: offset
    });

    let data = await user.findAll({
      raw: true,
      attributes: {
        exclude: ['kartu_keluarga']
      },
      limit: limit,
      offset: offset,
      order: [['created_dt', 'DESC']],
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        password: data[i].password,
        umur: data[i].umur,
        alamat: data[i].alamat,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        jenis_kelamin: data[i].jenis_kelamin,
        peserta_posyandu: data[i].peserta_posyandu,
        kartu_keluarga: data[i].kartu_keluarga,
        created_dt: moment(data[i].created_dt).format('YYYY-MM-DD'),
      })
    }

    let newRs = {
      rows: hasil,
      currentPage: page,
      totalPage: Math.ceil(rcount / limit),
      totalData: rcount
    };

    return res.status(200).json(rsmg(newRs))
  }catch(e){
    logger.error('error get data list peserta...', e);
    return utils.returnErrorFunction(res, 'error get data list peserta...', e);
  }
}