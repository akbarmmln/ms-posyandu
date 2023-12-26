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
const pdfTemplate = require('./templated/html');
const { exec } = require('child_process');

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

exports.search_peserta = async function(req, res){
  try{
    let hasil = [];
    let search = req.body.search;

    let data = await user.findAll({
      raw: true,
      attributes: {
        exclude: ['kartu_keluarga']
      },
      where: sequelize.literal(`nama like '%${search}%' or nik like '%${search}%'`),
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

    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error get data search peserta...', e);
    return utils.returnErrorFunction(res, 'error get data search peserta...', e);
  }
}

exports.detail_peserta_byid = async function(req, res){
  try{
    let id = req.body.id;
    let data = await user.findOne({
      raw: true,
      where: {
        id: id
      }
    })
    if(!data){
      return res.status(200).json(rsmg({}));
    }
    let mapping = {
      id: data.id,
      nama: data.nama,
      nik: data.nik,
      password: data.password,
      umur: data.umur,
      alamat: data.alamat,
      tanggal_lahir: moment(data.tanggal_lahir).format('YYYY-MM-DD'),
      jenis_kelamin: data.jenis_kelamin,
      peserta_posyandu: data.peserta_posyandu,
      kartu_keluarga: data.kartu_keluarga,
      created_dt: moment(data.created_dt).format('YYYY-MM-DD'),
    }
    return res.status(200).json(rsmg(mapping));
  }catch(e){
    logger.error('error get data peserta by id...', e);
    return utils.returnErrorFunction(res, 'error get data peserta by id...', e);
  }
}

exports.register = async function (req, res) {
  try {
    logger.debug('payload received for register...', JSON.stringify(req.body))
    let id = uuidv4()
    let nama = req.body.nama
    let nik = req.body.nik
    let umur = req.body.umur
    let alamat = req.body.alamat
    let tanggal_lahir = req.body.tanggal_lahir
    let jenis_kelamin = req.body.jenis_kelamin
    let peserta_posyandu = req.body.peserta_posyandu
    let kartu_keluarga = req.body.kartu_keluarga
    let password = req.body.password;
    
    let cekData = await user.findOne({
      raw: true,
      where: {
        nik: nik
      }
    })
    if(cekData){
      throw '10003'
    }

    let dataUpload = await rp({
      method: 'POST',
      uri: `http://localhost:${process.env.PORT}/api/v1/account/upload-file-single`,
      body: {
        file: kartu_keluarga,
        key: `kartu-keluarga/${moment().format('YYYYMMDDHHmmssSSS')}`
      },
      json: true
    })
    logger.debug('dataUpload', JSON.stringify(dataUpload))

    await user.create({
      id: id,
      nama: nama,
      nik: nik,
      umur: umur,
      alamat: alamat,
      tanggal_lahir: tanggal_lahir,
      jenis_kelamin:jenis_kelamin,
      peserta_posyandu: peserta_posyandu,
      kartu_keluarga: dataUpload.data.Location,
      password: await bcrypt.hash(password, saltRounds),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    return res.status(200).json(rsmg());
  } catch (e) {
    logger.error('error register...', e);
    return utils.returnErrorFunction(res, 'error register...', e);
  }
};

exports.list_kader = async function(req, res){
  try{
    let hasil = [];
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let rcount = await kader.count({
      raw: true,
      limit: limit,
      offset: offset
    });

    let data = await kader.findAll({
      raw: true,
      limit: limit,
      offset: offset
    })

    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        password: data[i].password,
        umur: data[i].umur,
        alamat: data[i].alamat,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD')
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
    logger.error('error get data list kader...', e);
    return utils.returnErrorFunction(res, 'error get data list kader...', e);
  }
}

exports.register_kader = async function (req, res) {
  try {
    let id = uuidv4()
    let nama = req.body.nama
    let nik = req.body.nik
    let umur = req.body.umur
    let alamat = req.body.alamat
    let tanggal_lahir = req.body.tanggal_lahir
    let password = req.body.password;
    
    let cekData = await kader.findOne({
      raw: true,
      where: {
        nik: nik
      }
    })
    if(cekData){
      throw '10003'
    }

    await kader.create({
      id: id,
      nama: nama,
      nik: nik,
      umur: umur,
      alamat: alamat,
      tanggal_lahir: tanggal_lahir,
      password: await bcrypt.hash(password, saltRounds)
    })
    return res.status(200).json(rsmg());
  } catch (e) {
    logger.error('error register...', e);
    return utils.returnErrorFunction(res, 'error register...', e);
  }
};

exports.login = async function(req,res){
  try{
    logger.debug('payload received for login...', JSON.stringify(req.body), req.headers['ip-address'])
    let nik = req.body.nik
    let password = req.body.password
    let device_id = req.body.device_id

    if(await format.isEmpty(device_id)){
      device_id = 'dev'
    }

    let data = await user.findOne({
      raw:true,
      exclude: ['kartu_keluarga'],
      where:{
        nik:nik
      }
    })
    if (!data) {
      throw '10001'
    }

    let password_encrypt = data.password;
    let checkpassword = await bcrypt.compare(password, password_encrypt);
    if (!checkpassword) {
      throw '10002'
    }

    await user.update({
      device_id: device_id
    },{
      where: {
        id: data.id
      }
    })

    res.status(200).json(rsmg(data))
  }catch (e) {
    logger.error('error login...', e);
    return utils.returnErrorFunction(res, 'error login...', e);
  }
}

exports.login_kader = async function(req,res){
  try{
    let nik = req.body.nik
    let password = req.body.password

    let data = await kader.findOne({
      raw:true,
      where:{
        nik:nik
      }
    })
    if (!data) {
      throw '10001'
    }

    let password_encrypt = data.password;
    let checkpassword = await bcrypt.compare(password, password_encrypt);
    if (!checkpassword) {
      throw '10002'
    }

    res.status(200).json(rsmg(data))
  }catch (e) {
    logger.error('error login...', e);
    return utils.returnErrorFunction(res, 'error login...', e);
  }
}

exports.lupapassword = async function(req,res){
  try{
    let nik = req.body.nik
    let password = req.body.password

    let data = await user.findOne({
      raw:true,
      where:{
        nik:nik
      }
    })
    if (!data) {
      throw '10001'
    }

   await user.update({
    password: await bcrypt.hash(password, saltRounds)
   } , {
    where: {
      nik:nik
    }
   })

    res.status(200).json(rsmg())
  }catch (e) {
    logger.error('error login...', e);
    return utils.returnErrorFunction(res, 'error login...', e);
  }
}

exports.uploadKartuKeluarga = async function(req, res){
  try{
    let id = req.body.id;
    let kk = req.body.kk;

    let dataUpload = await rp({
      method: 'POST',
      uri: `http://localhost:${process.env.PORT}/api/v1/account/upload-file-single`,
      body: {
        file: kk,
        key: `kartu-keluarga/${moment().format('YYYYMMDDHHmmssSSS')}`
      },
      json: true
    })
    logger.debug('dataUpload', JSON.stringify(dataUpload))

    await user.update({
      kartu_keluarga: dataUpload.data.Location,
    },{
      where: {
        id: id
      }
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error upload kartu keluarga...', e);
    return utils.returnErrorFunction(res, 'error upload kartu keluarga...', e);
  }
}

exports.lupapassword_kader = async function(req,res){
  try{
    let nik = req.body.nik
    let password = req.body.password

    let data = await kader.findOne({
      raw:true,
      where:{
        nik: nik
      }
    })
    if (!data) {
      throw '10001'
    }

   await kader.update({
    password: await bcrypt.hash(password, saltRounds)
   } , {
    where: {
      nik: nik
    }
   })

    res.status(200).json(rsmg())
  }catch (e) {
    logger.error('error login...', e);
    return utils.returnErrorFunction(res, 'error login...', e);
  }
}

exports.removeAccount = async function(req,res){
  try{
    let id = req.body.id

    await user.destroy({
      where:{
        id: id
      }
    })

    res.status(200).json(rsmg());
  }catch (e) {
    logger.error('error remove account...', e);
    return utils.returnErrorFunction(res, 'error remove account...', e);
  }
}

exports.check_nik_peserta = async function(req, res){
  try{
    let nik = req.body.nik;
    let type = req.body.type;
    let data;

    if(await format.isEmpty(type)){
      data = await user.findOne({
        raw: true,
        exclude: ['kartu_keluarga'],
        where: {
          nik: nik
        }
      })  
    }else{
      data = await user.findOne({
        raw: true,
        exclude: ['kartu_keluarga'],
        where: {
          nik: nik,
          peserta_posyandu: type
        }
      })
    }

    if(!data){
      return res.status(200).json(rsmg({}))
    }

    let hasil = {
      id: data.id,
      nama: data.nama,
      nik: data.nik,
      password: data.password,
      umur: data.umur,
      alamat: data.alamat,
      tanggal_lahir: moment(data.tanggal_lahir).format('YYYY-MM-DD'),
      jenis_kelamin: data.jenis_kelamin,
      peserta_posyandu: data.peserta_posyandu,
      kartu_keluarga: data.kartu_keluarga,
      created_dt: data.created_dt,
      device_id: data.device_id
    }

    return res.status(200).json(rsmg(hasil))
  }catch(e){
    logger.error('error check nik peserta', e)
    return utils.returnErrorFunction(res, 'error check nik peserta', e)
  }
}

exports.save_checkup_balita = async function(req, res){
  try{
    let time = moment().format('HH:mm:ss');
    let id = uuidv4();
    let nama = req.body.nama;
    let nik = req.body.nik;
    let umur = req.body.umur;
    let tgl_periksa = req.body.tgl_periksa;
    let berat_badan = req.body.berat_badan;
    let ket_berat_badan = req.body.ket_berat_badan;
    let tinggi_badan = req.body.tinggi_badan;
    let ket_tinggi_badan = req.body.ket_tinggi_badan;
    let lingkar_kepala = req.body.lingkar_kepala;
    let ket_lingkar_kepala = req.body.ket_lingkar_kepala;
    let jenis_imunisasi = req.body.jenis_imunisasi;
    let catatan = req.body.catatan;
    let obat = req.body.obat;
    let orang_tua_kandung = req.body.orang_tua_kandung;
    let account_id = req.body.account_id;
    let tanggal_lahir = req.body.tanggal_lahir;
    let title = "Hasil Pemeriksaan";
    let message = "Hasil Pemeriksaan dapat dilihat pada detail berikut";
    let page_link = "laporan_balita";
    let data = {
      page_link: "laporan_balita",
      link_id: id,
      catatan: catatan,
      obat: obat
    }

    let users = await user.findOne({
      attributes: ['device_id'],
      raw: true,
      where: {
        id: account_id
      }
    })
    
    if(!await format.isEmpty(users.device_id) && users.device_id !== 'dev'){
      try{
        let payloadNotif = {
          method: 'POST',
          uri: 'https://onesignal.com/api/v1/notifications',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Basic ZDZlODIxZWMtZjg5MC00ZTA5LWEwODgtN2EzODdlNDk5NjRm'
          },
          body: {
            app_id: 'ccf10458-33fd-485b-bee2-a45f8c816de2',
            headings: {
              en: title
            },
            contents: {
              en: message
            },
            priority: 10,
            include_player_ids: [users.device_id],
            data: {
              link_id: id,
              page_link: page_link
            }
          },
          json: true // Automatically stringifies the body to JSON
        }  
        await rp(payloadNotif)
      }catch(e){
        logger.error('error notif pemeriksaan balita...', e)
      }
    }

    await AdrCheckupBalita.create({
      id: id,
      nama: nama,
      nik: nik,
      umur: umur,
      tgl_periksa: moment(`${tgl_periksa} ${time}`).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      ket_berat_badan: ket_berat_badan,
      tinggi_badan: tinggi_badan,
      ket_tinggi_badan: ket_tinggi_badan,
      lingkar_kepala: lingkar_kepala,
      ket_lingkar_kepala: ket_lingkar_kepala,
      jenis_imunisasi: jenis_imunisasi,
      catatan: catatan,
      obat: obat,
      orang_tua_kandung: orang_tua_kandung,
      account_id: account_id,
      tanggal_lahir: moment(tanggal_lahir).format('YYYY-MM-DD HH:mm:ss'),
      rating: '0'
    })

    await AdrActivity.create({
      id: uuidv4(),
      account_id: account_id,
      group: "notif_pemeriksaan",
      title: title,
      message: message,
      page_link: page_link,
      data: JSON.stringify(data),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss')
    })

    return res.status(200).json(rsmg())
  }catch(e){
    logger.error('error simpan data checkup balita', e)
    return utils.returnErrorFunction(res, 'error simpan data checkup balita', e)
  }
}

exports.update_checkup_balita = async function(req, res){
  try{
    let id = req.body.id;
    let nama = req.body.nama;
    let nik = req.body.nik;
    let umur = req.body.umur;
    let tgl_periksa = req.body.tgl_periksa;
    let berat_badan = req.body.berat_badan;
    let ket_berat_badan = req.body.ket_berat_badan;
    let tinggi_badan = req.body.tinggi_badan;
    let ket_tinggi_badan = req.body.ket_tinggi_badan;
    let lingkar_kepala = req.body.lingkar_kepala;
    let ket_lingkar_kepala = req.body.ket_lingkar_kepala;
    let jenis_imunisasi = req.body.jenis_imunisasi;
    let catatan = req.body.catatan;
    let obat = req.body.obat;
    let orang_tua_kandung = req.body.orang_tua_kandung;

    await AdrCheckupBalita.update({
      nama: nama,
      nik: nik,
      umur: umur,
      tgl_periksa: moment(tgl_periksa).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      ket_berat_badan: ket_berat_badan,
      tinggi_badan: tinggi_badan,
      ket_tinggi_badan: ket_tinggi_badan,
      lingkar_kepala: lingkar_kepala,
      ket_lingkar_kepala: ket_lingkar_kepala,
      jenis_imunisasi: jenis_imunisasi,
      catatan: catatan,
      obat: obat,
      orang_tua_kandung: orang_tua_kandung
    },{
      where: {
        id: id
      }
    })

    return res.status(200).json(rsmg())
  }catch(e){
    logger.error('error update data checkup balita', e)
    return utils.returnErrorFunction(res, 'error update data checkup balita', e)
  }
}

exports.delete_checkup_balita = async function(req, res){
  try{
    let id = req.body.id;

    await AdrCheckupBalita.destroy({
      where: {id: id},
    })

    return res.status(200).json(rsmg())
  }catch(e){
    logger.error('error update data checkup balita', e)
    return utils.returnErrorFunction(res, 'error update data checkup balita', e)
  }
}

exports.list_checkup_balita = async function(req, res){
  try{
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let hasil = [];
    let rcount = await AdrCheckupBalita.count({
      raw: true,
      limit: limit,
      offset: offset
    });

    let data = await AdrCheckupBalita.findAll({
      raw: true,
      limit: limit,
      offset: offset,
      order: [['tgl_periksa', 'DESC']],
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        umur: data[i].umur,
        tgl_periksa: moment(data[i].tgl_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        ket_berat_badan: data[i].ket_berat_badan,
        tinggi_badan: data[i].tinggi_badan,
        ket_tinggi_badan: data[i].ket_tinggi_badan,
        lingkar_kepala: data[i].lingkar_kepala,
        ket_lingkar_kepala: data[i].ket_lingkar_kepala,
        jenis_imunisasi: data[i].jenis_imunisasi,
        catatan: data[i].catatan,
        obat: data[i].obat,
        orang_tua_kandung: data[i].orang_tua_kandung,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
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
    logger.error('error check list checkup balita', e)
    return utils.returnErrorFunction(res, 'error check list checkup balita', e)
  }
}

exports.search_checkup_balita = async function(req, res){
  try{
    logger.debug('payload received for search_checkup_balita...', JSON.stringify(req.body))
    let hasil = [];
    let search = req.body.search;

    let data = await AdrCheckupBalita.findAll({
      raw: true,
      where: sequelize.literal(`nama like '%${search}%' or nik like '%${search}%'`)
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        umur: data[i].umur,
        tgl_periksa: moment(data[i].tgl_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        ket_berat_badan: data[i].ket_berat_badan,
        tinggi_badan: data[i].tinggi_badan,
        ket_tinggi_badan: data[i].ket_tinggi_badan,
        lingkar_kepala: data[i].lingkar_kepala,
        ket_lingkar_kepala: data[i].ket_lingkar_kepala,
        jenis_imunisasi: data[i].jenis_imunisasi,
        catatan: data[i].catatan,
        obat: data[i].obat,
        orang_tua_kandung: data[i].orang_tua_kandung,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
      })
    }

    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error search list checkup balita', e)
    return utils.returnErrorFunction(res, 'error search list checkup balita', e)
  }
}

exports.save_checkup_lansia = async function(req, res){
  try{
    let time = moment().format('HH:mm:ss');
    let id = uuidv4();
    let nama = req.body.nama;
    let nik = req.body.nik;
    let umur = req.body.umur;
    let jenis_kelamin = req.body.jenis_kelamin;
    let tgl_periksa = req.body.tgl_periksa;
    let berat_badan = req.body.berat_badan;
    let tinggi_badan = req.body.tinggi_badan;
    let tensi_darah = req.body.tensi_darah;
    let ket_tensi_darah = req.body.ket_tensi_darah;
    let asam_urat = req.body.asam_urat;
    let ket_asam_urat = req.body.ket_asam_urat;
    let kolerstrol = req.body.kolerstrol;
    let ket_kolerstrol = req.body.ket_kolerstrol;
    let catatan = req.body.catatan;
    let obat = req.body.obat;
    let account_id = req.body.account_id;
    let tanggal_lahir = req.body.tanggal_lahir;
    let title = "Hasil Pemeriksaan";
    let message = "Hasil Pemeriksaan dapat dilihat pada detail berikut";
    let page_link = "laporan_lansia";
    let data = {
      page_link: "laporan_lansia",
      link_id: id,
      catatan: catatan,
      obat: obat
    }

    let users = await user.findOne({
      attributes: ['device_id'],
      raw: true,
      where: {
        id: account_id
      }
    })

    if(!await format.isEmpty(users.device_id) && users.device_id !== 'dev'){
      try{
        let payloadNotif = {
          method: 'POST',
          uri: 'https://onesignal.com/api/v1/notifications',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Basic ZDZlODIxZWMtZjg5MC00ZTA5LWEwODgtN2EzODdlNDk5NjRm'
          },
          body: {
            app_id: 'ccf10458-33fd-485b-bee2-a45f8c816de2',
            headings: {
              en: title
            },
            contents: {
              en: message
            },
            priority: 10,
            include_player_ids: [users.device_id],
            data: {
              link_id: id,
              page_link: page_link
            }
          },
          json: true // Automatically stringifies the body to JSON
        }  
        await rp(payloadNotif)
      }catch(e){
        logger.error('error notif pemeriksaan balita...', e)
      }
    }

    await AdrCheckupLansia.create({
      id: id,
      nama: nama,
      nik: nik,
      umur: umur,
      jenis_kelamin: jenis_kelamin,
      tgl_periksa: moment(`${tgl_periksa} ${time}`).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      tinggi_badan: tinggi_badan,
      tensi_darah: tensi_darah,
      ket_tensi_darah: ket_tensi_darah,
      asam_urat: asam_urat,
      ket_asam_urat: ket_asam_urat,
      kolerstrol: kolerstrol,
      ket_kolerstrol: ket_kolerstrol,
      catatan: catatan,
      obat: obat,
      account_id: account_id,
      tanggal_lahir: moment(tanggal_lahir).format('YYYY-MM-DD HH:mm:ss'),
      rating: '0'
    })

    await AdrActivity.create({
      id: uuidv4(),
      account_id: account_id,
      group: "notif_pemeriksaan",
      title: title,
      message: message,
      page_link: page_link,
      data: JSON.stringify(data),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss')
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error save checkup lansia', e)
    return utils.returnErrorFunction(res, 'error save checkup lansia', e)
  }
}

exports.list_checkup_lansia = async function(req, res){
  try{
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let hasil = [];
    let rcount = await AdrCheckupLansia.count({
      raw: true,
      limit: limit,
      offset: offset
    });

    let data = await AdrCheckupLansia.findAll({
      raw: true,
      limit: limit,
      offset: offset,
      order: [['tgl_periksa', 'DESC']],
    })

    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        umur: data[i].umur,
        jenis_kelamin: data[i].jenis_kelamin,
        tgl_periksa: moment(data[i].tgl_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        tinggi_badan: data[i].tinggi_badan,
        tensi_darah: data[i].tensi_darah,
        ket_tensi_darah: data[i].ket_tensi_darah,
        asam_urat: data[i].asam_urat,
        ket_asam_urat: data[i].ket_asam_urat,
        kolerstrol: data[i].kolerstrol,
        ket_kolerstrol: data[i].ket_kolerstrol,
        catatan: data[i].catatan,
        obat: data[i].obat,
        account_id: data[i].account_id,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
      })
    }

    let newRs = {
      rows: hasil,
      currentPage: page,
      totalPage: Math.ceil(rcount / limit),
      totalData: rcount
    };

    return res.status(200).json(rsmg(newRs));
  }catch(e){
    logger.error('error get data list checkup lansia', e)
    return utils.returnErrorFunction(res, 'error get data list checkup lansia', e)
  }
}

exports.update_checkup_lansia = async function(req, res){
  try{
    let id = req.body.id;
    let nama = req.body.nama;
    let nik = req.body.nik;
    let umur = req.body.umur;
    let jenis_kelamin = req.body.jenis_kelamin;
    let tgl_periksa = req.body.tgl_periksa;
    let berat_badan = req.body.berat_badan;
    let tinggi_badan = req.body.tinggi_badan;
    let tensi_darah = req.body.tensi_darah;
    let ket_tensi_darah = req.body.ket_tensi_darah;
    let asam_urat = req.body.asam_urat;
    let ket_asam_urat = req.body.ket_asam_urat;
    let kolerstrol = req.body.kolerstrol;
    let ket_kolerstrol = req.body.ket_kolerstrol;
    let catatan = req.body.catatan;
    let obat = req.body.obat;

    await AdrCheckupLansia.update({
      nama: nama,
      nik: nik,
      umur: umur,
      jenis_kelamin: jenis_kelamin,
      tgl_periksa: moment(tgl_periksa).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      tinggi_badan: tinggi_badan,
      tensi_darah: tensi_darah,
      ket_tensi_darah: ket_tensi_darah,
      asam_urat: asam_urat,
      ket_asam_urat: ket_asam_urat,
      kolerstrol: kolerstrol,
      ket_kolerstrol: ket_kolerstrol,
      catatan: catatan,
      obat: obat
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error update data checkup lansia', e)
    return utils.returnErrorFunction(res, 'error update data checkup lansia', e)
  }
}

exports.delete_checkup_lansia = async function(req, res){
  try{
    let id = req.body.id;

    await AdrCheckupLansia.destroy({
      where: {id: id},
    })

    return res.status(200).json(rsmg())
  }catch(e){
    logger.error('error delete data checkup lansia', e)
    return utils.returnErrorFunction(res, 'error delete data checkup lansia', e)
  }
}

exports.search_checkup_lansia = async function(req, res){
  try{
    logger.debug('payload received for search_checkup_lansia...', JSON.stringify(req.body))
    let hasil = [];
    let search = req.body.search;

    let data = await AdrCheckupLansia.findAll({
      raw: true,
      where: sequelize.literal(`nama like '%${search}%' or nik like '%${search}%'`)
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        umur: data[i].umur,
        jenis_kelamin: data[i].jenis_kelamin,
        tgl_periksa: moment(data[i].tgl_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        tinggi_badan: data[i].tinggi_badan,
        tensi_darah: data[i].tensi_darah,
        ket_tensi_darah: data[i].ket_tensi_darah,
        asam_urat: data[i].asam_urat,
        ket_asam_urat: data[i].ket_asam_urat,
        kolerstrol: data[i].kolerstrol,
        ket_kolerstrol: data[i].ket_kolerstrol,
        catatan: data[i].catatan,
        obat: data[i].obat,
        account_id: data[i].account_id,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
      })
    }

    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error search list checkup balita', e)
    return utils.returnFunction(res, 'error search list checkup balita', e)
  }
}

exports.define_grafik_balita = async function(req, res){
  try{
    let xAxis = [], yAxis = {
      berat_badan: [],
      tinggi_badan: [],
      lingkar_kepala: []
    }
    let nik = req.body.nik;
    let id = req.body.id;
    let tahun = moment().format('YYYY');
    let listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    if(await format.isEmpty(nik)){
      let data = await user.findOne({
        raw: true,
        where: {
          id: id
        }
      })
      if(!data){
        return res.status(200).json(rsmg({
          xAxis: xAxis,
          yAxis: yAxis
        }));
      }
      nik = data.nik
    }

    let data = await AdrCheckupBalita.findAll({
      raw: true,
      where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' order by tgl_periksa asc`)
    })
    if(data.length <= 0){
      return res.status(200).json(rsmg({
        xAxis: xAxis,
        yAxis: yAxis
      }));  
    }

    let lastMonth = moment(data[data.length-1].tgl_periksa).format('MM')

    for(let i=0; i<lastMonth; i++){
      xAxis.push(listBulan[i]) 
    }

    for(let i=0; i<xAxis.length; i++){
      let detailBeratBadan = await AdrCheckupBalita.findOne({
        raw: true,
        attributes: ['berat_badan'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailTinggiBadan = await AdrCheckupBalita.findOne({
        raw: true,
        attributes: ['tinggi_badan'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailLingkarKepala = await AdrCheckupBalita.findOne({
        raw: true,
        attributes: ['lingkar_kepala'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })

      yAxis.berat_badan.push(detailBeratBadan ? detailBeratBadan.berat_badan : 0)
      yAxis.tinggi_badan.push(detailTinggiBadan ? detailTinggiBadan.tinggi_badan : 0)
      yAxis.lingkar_kepala.push(detailLingkarKepala ? detailLingkarKepala.lingkar_kepala: 0)
    }
    return res.status(200).json(rsmg({
      xAxis: xAxis,
      yAxis: yAxis
    }));
  }catch(e){
    logger.error('error define grafik...', e)
    return utils.returnErrorFunction(res, 'error define grafik', e)
  }
}

exports.define_grafik_lansia = async function(req, res){
  try{
    let xAxis = [], yAxis = {
      berat_badan: [],
      tinggi_badan: [],
      tensi_darah: [],
      asam_urat: [],
      kolerstrol: []
    }
    let nik = req.body.nik;
    let id = req.body.id;
    let tahun = moment().format('YYYY');
    let listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    if(await format.isEmpty(nik)){
      let data = await user.findOne({
        raw: true,
        where: {
          id: id
        }
      })
      if(!data){
        return res.status(200).json(rsmg({
          xAxis: xAxis,
          yAxis: yAxis
        }));
      }
      nik = data.nik
    }

    let data = await AdrCheckupLansia.findAll({
      raw: true,
      where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' order by tgl_periksa asc`)
    })
    if(data.length <= 0){
      return res.status(200).json(rsmg({
        xAxis: xAxis,
        yAxis: yAxis
      }));  
    }

    let lastMonth = moment(data[data.length-1].tgl_periksa).format('MM')

    for(let i=0; i<lastMonth; i++){
      xAxis.push(listBulan[i]) 
    }

    for(let i=0; i<xAxis.length; i++){
      let detailBeratBadan = await AdrCheckupLansia.findOne({
        raw: true,
        attributes: ['berat_badan'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailTinggiBadan = await AdrCheckupLansia.findOne({
        raw: true,
        attributes: ['tinggi_badan'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailTensiDarah = await AdrCheckupLansia.findOne({
        raw: true,
        attributes: ['tensi_darah'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailAsamUrat = await AdrCheckupLansia.findOne({
        raw: true,
        attributes: ['asam_urat'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })
      let detailKolestrol = await AdrCheckupLansia.findOne({
        raw: true,
        attributes: ['kolerstrol'],
        where: sequelize.literal(`nik = '${nik}' and year(tgl_periksa) = '${tahun}' and month(tgl_periksa) = '${i+1}'`)
      })

      yAxis.berat_badan.push(detailBeratBadan ? detailBeratBadan.berat_badan : 0)
      yAxis.tinggi_badan.push(detailTinggiBadan ? detailTinggiBadan.tinggi_badan : 0)
      yAxis.tensi_darah.push(detailTensiDarah ? detailTensiDarah.tensi_darah : 0)
      yAxis.asam_urat.push(detailAsamUrat ? detailAsamUrat.asam_urat : 0)
      yAxis.kolerstrol.push(detailKolestrol ? detailKolestrol.kolerstrol : 0)
    }
    return res.status(200).json(rsmg({
      xAxis: xAxis,
      yAxis: yAxis
    }));
  }catch(e){
    logger.error('error define grafik...', e)
    return utils.returnErrorFunction(res, 'error define grafik', e)
  }
}

exports.define_grafik_ibu_hamil = async function(req, res){
  try{
    let xAxis = [], yAxis = {
      berat_badan: [],
      denyut_jantung_bayi: [],
      tinggi_fundus: []
    }
    let nik = req.body.nik;
    let id = req.body.id;
    let tahun = moment().format('YYYY');
    let listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    if(await format.isEmpty(nik)){
      let data = await user.findOne({
        raw: true,
        where: {
          id: id
        }
      })
      if(!data){
        return res.status(200).json(rsmg({
          xAxis: xAxis,
          yAxis: yAxis
        }));
      }
      nik = data.nik
    }

    let data = await AdrCheckupIbuHamil.findAll({
      raw: true,
      where: sequelize.literal(`nik = '${nik}' and year(tanggal_periksa) = '${tahun}' order by tanggal_periksa asc`)
    })
    if(data.length <= 0){
      return res.status(200).json(rsmg({
        xAxis: xAxis,
        yAxis: yAxis
      }));  
    }

    let lastMonth = moment(data[data.length-1].tanggal_periksa).format('MM')

    for(let i=0; i<lastMonth; i++){
      xAxis.push(listBulan[i]) 
    }

    for(let i=0; i<xAxis.length; i++){
      let detailBB = await AdrCheckupIbuHamil.findOne({
        raw: true,
        attributes: ['berat_badan'],
        where: sequelize.literal(`nik = '${nik}' and year(tanggal_periksa) = '${tahun}' and month(tanggal_periksa) = '${i+1}'`)
      })
      let detailDJB = await AdrCheckupIbuHamil.findOne({
        raw: true,
        attributes: ['denyut_jantung_bayi'],
        where: sequelize.literal(`nik = '${nik}' and year(tanggal_periksa) = '${tahun}' and month(tanggal_periksa) = '${i+1}'`)
      })
      let detailTF = await AdrCheckupIbuHamil.findOne({
        raw: true,
        attributes: ['tinggi_fundus'],
        where: sequelize.literal(`nik = '${nik}' and year(tanggal_periksa) = '${tahun}' and month(tanggal_periksa) = '${i+1}'`)
      })

      yAxis.berat_badan.push(detailBB ? detailBB.berat_badan : 0)
      yAxis.denyut_jantung_bayi.push(detailDJB ? detailDJB.denyut_jantung_bayi : 0)
      yAxis.tinggi_fundus.push(detailTF ? detailTF.tinggi_fundus : 0)
    }
    return res.status(200).json(rsmg({
      xAxis: xAxis,
      yAxis: yAxis
    }));
  }catch(e){
    logger.error('error define grafik...', e)
    return utils.returnErrorFunction(res, 'error define grafik', e)
  }
}

exports.save_checkup_hamil = async function(req, res){
  try{
    let time = moment().format('HH:mm:ss');
    let id = uuidv4();
    let nama = req.body.nama;
    let nik = req.body.nik;
    let nama_suami = req.body.nama_suami;
    let usia_hamil = req.body.usia_hamil;
    let tgl_periksa = req.body.tgl_periksa;
    let berat_badan = req.body.berat_badan;
    let tensi_darah = req.body.tensi_darah;
    let ket_tensi_darah = req.body.ket_tensi_darah;
    let lingkar_lengan_atas = req.body.lingkar_lengan_atas;
    let ket_lingkar_lengan_atas = req.body.ket_lingkar_lengan_atas;
    let denyut_jantung_bayi = req.body.denyut_jantung_bayi;
    let ket_denyut_jantung_bayi = req.body.ket_denyut_jantung_bayi;
    let catatan = req.body.catatan;
    let obat = req.body.obat;
    let account_id = req.body.account_id;
    let tinggi_fundus = req.body.tinggi_fundus;
    let ket_tinggi_fundus = req.body.ket_tinggi_fundus;
    let tanggal_lahir = req.body.tanggal_lahir;
    let title = "Hasil Pemeriksaan";
    let message = "Hasil Pemeriksaan dapat dilihat pada detail berikut";
    let page_link = "laporan_ibu_hamil";
    let data = {
      page_link: "laporan_ibu_hamil",
      link_id: id,
      catatan: catatan,
      obat: obat
    }

    let users = await user.findOne({
      attributes: ['device_id'],
      raw: true,
      where: {
        id: account_id
      }
    })

    if(!await format.isEmpty(users.device_id) && users.device_id !== 'dev'){
      try{
        let payloadNotif = {
          method: 'POST',
          uri: 'https://onesignal.com/api/v1/notifications',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': 'Basic ZDZlODIxZWMtZjg5MC00ZTA5LWEwODgtN2EzODdlNDk5NjRm'
          },
          body: {
            app_id: 'ccf10458-33fd-485b-bee2-a45f8c816de2',
            headings: {
              en: title
            },
            contents: {
              en: message
            },
            priority: 10,
            include_player_ids: [users.device_id],
            data: {
              link_id: id,
              page_link: page_link
            }
          },
          json: true // Automatically stringifies the body to JSON
        }  
        await rp(payloadNotif)
      }catch(e){
        logger.error('error notif pemeriksaan balita...', e)
      }
    }

    await AdrCheckupIbuHamil.create({
      id: id,
      nama: nama,
      nik: nik,
      nama_suami: nama_suami,
      usia_hamil: usia_hamil,
      tanggal_periksa: moment(`${tgl_periksa} ${time}`).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      tensi_darah: tensi_darah,
      ket_tensi_darah: ket_tensi_darah,
      lingkar_lengan_atas: lingkar_lengan_atas,
      ket_lingkar_lengan_atas: ket_lingkar_lengan_atas,
      denyut_jantung_bayi: denyut_jantung_bayi,
      ket_denyut_jantung_bayi: ket_denyut_jantung_bayi,
      catatan: catatan,
      obat: obat,
      account_id: account_id,
      tinggi_fundus: tinggi_fundus,
      ket_tinggi_fundus: ket_tinggi_fundus,
      tanggal_lahir: moment(tanggal_lahir).format('YYYY-MM-DD HH:mm:ss'),
      rating: '0'
    })

    await AdrActivity.create({
      id: uuidv4(),
      account_id: account_id,
      group: "notif_pemeriksaan",
      title: title,
      message: message,
      page_link: page_link,
      data: JSON.stringify(data),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss')
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error save checkup hamil...', e)
    return utils.returnErrorFunction(res, 'error save checkup hamil', e)
  }
}

exports.list_checkup_hamil = async function(req, res){
  try{
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let hasil = [];
    let rcount = await AdrCheckupIbuHamil.count({
      raw: true,
      limit: limit,
      offset: offset
    });

    let data = await AdrCheckupIbuHamil.findAll({
      raw: true,
      limit: limit,
      offset: offset,
      order: [['tanggal_periksa', 'DESC']],
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        nama_suami: data[i].nama_suami,
        usia_hamil: data[i].usia_hamil,
        tanggal_periksa: moment(data[i].tanggal_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        tensi_darah: data[i].tensi_darah,
        ket_tensi_darah: data[i].ket_tensi_darah,
        lingkar_lengan_atas: data[i].lingkar_lengan_atas,
        ket_lingkar_lengan_atas: data[i].ket_lingkar_lengan_atas,
        denyut_jantung_bayi: data[i].denyut_jantung_bayi,
        ket_denyut_jantung_bayi: data[i].ket_denyut_jantung_bayi,
        tinggi_fundus: data[i].tinggi_fundus,
        ket_tinggi_fundus: data[i].ket_tinggi_fundus,
        catatan: data[i].catatan,
        obat: data[i].obat,
        account_id: data[i].account_id,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
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
    logger.error('error check list checkup hamil', e)
    return utils.returnErrorFunction(res, 'error check list checkup hamil', e)

  }
}

exports.update_checkup_hamil = async function(req, res){
  try{
    let id = req.body.id;
    let nama = req.body.nama;
    let nik = req.body.nik;
    let nama_suami = req.body.nama_suami;
    let usia_hamil = req.body.usia_hamil;
    let tanggal_periksa = req.body.tanggal_periksa;
    let berat_badan = req.body.berat_badan;
    let tensi_darah = req.body.tensi_darah;
    let ket_tensi_darah = req.body.ket_tensi_darah;
    let lingkar_lengan_atas = req.body.lingkar_lengan_atas;
    let ket_lingkar_lengan_atas = req.body.ket_lingkar_lengan_atas;
    let denyut_jantung_bayi = req.body.denyut_jantung_bayi;
    let ket_denyut_jantung_bayi = req.body.ket_denyut_jantung_bayi;
    let tinggi_fundus = req.body.tinggi_fundus
    let ket_tinggi_fundus = req.body.ket_tinggi_fundus
    let catatan = req.body.catatan;
    let obat = req.body.obat;

    await AdrCheckupIbuHamil.update({
      nama: nama,
      nik: nik,
      nama_suami: nama_suami,
      usia_hamil: usia_hamil,
      tanggal_periksa: moment(tanggal_periksa).format('YYYY-MM-DD HH:mm:ss'),
      berat_badan: berat_badan,
      tensi_darah: tensi_darah,
      ket_tensi_darah: ket_tensi_darah,
      lingkar_lengan_atas: lingkar_lengan_atas,
      ket_lingkar_lengan_atas: ket_lingkar_lengan_atas,
      denyut_jantung_bayi: denyut_jantung_bayi,
      ket_denyut_jantung_bayi: ket_denyut_jantung_bayi,
      tinggi_fundus: tinggi_fundus,
      ket_tinggi_fundus: ket_tinggi_fundus,
      catatan: catatan,
      obat: obat
    }, {
      where: {
        id: id
      }
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error update data checkup lansia', e)
    return utils.returnErrorFunction(res, 'error update data checkup lansia', e)
  }
}

exports.delete_checkup_hamil = async function(req, res){
  try{
    let id = req.body.id;

    await AdrCheckupIbuHamil.destroy({
      where: {id: id},
    })

    return res.status(200).json(rsmg())
  }catch(e){
    logger.error('error delete data checkup hamil', e)
    return utils.returnErrorFunction(res, 'error delete data checkup hamil', e)
  }
}

exports.search_checkup_hamil = async function(req, res){
  try{
    let hasil = [];
    let search = req.body.search;

    let data = await AdrCheckupIbuHamil.findAll({
      raw: true,
      where: sequelize.literal(`nama like '%${search}%' or nik like '%${search}%'`)
    })
    for(let i=0; i<data.length; i++){
      hasil.push({
        id: data[i].id,
        nama: data[i].nama,
        nik: data[i].nik,
        nama_suami: data[i].nama_suami,
        usia_hamil: data[i].usia_hamil,
        tanggal_periksa: moment(data[i].tanggal_periksa).format('YYYY-MM-DD'),
        berat_badan: data[i].berat_badan,
        tensi_darah: data[i].tensi_darah,
        ket_tensi_darah: data[i].ket_tensi_darah,
        lingkar_lengan_atas: data[i].lingkar_lengan_atas,
        ket_lingkar_lengan_atas: data[i].ket_lingkar_lengan_atas,
        denyut_jantung_bayi: data[i].denyut_jantung_bayi,
        ket_denyut_jantung_bayi: data[i].ket_denyut_jantung_bayi,
        tinggi_fundus: data[i].tinggi_fundus,
        ket_tinggi_fundus: data[i].ket_tinggi_fundus,
        catatan: data[i].catatan,
        obat: data[i].obat,
        account_id: data[i].account_id,
        tanggal_lahir: moment(data[i].tanggal_lahir).format('YYYY-MM-DD'),
        rating: data[i].rating,
      })
    }

    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error search list checkup hamil', e)
    return utils.returnErrorFunction(res, 'error search list checkup hamil', e)
  }
}

exports.notifikasi = async function(req, res){
  try{
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    let title = req.body.title;
    let group = req.body.group;
    let message = req.body.message;
    let page_link = req.body.page_link;
    let device_id = req.body.device_id;
    let data = req.body.data;
    let player_id = [];
    let id_account = [];

    if(await format.isEmpty(data)){
      data = {}
    }

    if(await format.isEmpty(device_id)){
      let userActive = await user.findAll({
        attributes: ['id', 'device_id'],
        raw: true
      })

      for(let i=0; i<userActive.length; i++){
        if(!await format.isEmpty(userActive[i].device_id) && userActive[i].device_id !== 'dev'){
          player_id.push(userActive[i].device_id)
        }
        id_account.push(userActive[i].id)
      }
    }

    if(player_id.length > 0){
      let payloadNotif = {
        method: 'POST',
        uri: 'https://onesignal.com/api/v1/notifications',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': 'Basic ZDZlODIxZWMtZjg5MC00ZTA5LWEwODgtN2EzODdlNDk5NjRm'
        },
        body: {
          app_id: 'ccf10458-33fd-485b-bee2-a45f8c816de2',
          headings: {
            en: title
          },
          contents: {
            en: message
          },
          priority: 10,
          include_player_ids: player_id,
          data: {
            page_link: page_link
          }
        },
        json: true // Automatically stringifies the body to JSON
      }
      await rp(payloadNotif);  
    }

    for(let k=0; k<id_account.length; k++){
      try{
        await AdrActivity.create({
          id: uuidv4(),
          account_id: id_account[k],
          group: group,
          title: title,
          message: message,
          page_link: page_link,
          data: JSON.stringify(data),
          created_dt: moment().format('YYYY-MM-DD')
        })  
      }catch(e){
        continue;
      }
    }
    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error send notifikasi...', e)
    return utils.returnErrorFunction(res, 'error send notifikasi', e)
  }
}

exports.list_activity = async function(req, res){
  try{
    let account_id = req.body.account_id;
    let page = parseInt(req.body.page);
    let limit = 10;
    let offset = limit * (page - 1);

    let hasil = [];
    let rcount = await AdrActivity.count({
      raw: true,
      limit: limit,
      offset: offset,
      where: {
        account_id: account_id
      },
    });

    let data = await AdrActivity.findAll({
      raw: true,
      limit: limit,
      offset: offset,
      where: {
        account_id: account_id
      },
      order: [['created_dt', 'DESC']],
    })
    for(let i=0; i<data.length; i++){
      let rating = 0;
      if(!await format.isEmpty(data[i].data)){
        let dataObject = JSON.parse(data[i].data)
        if(dataObject.page_link === 'laporan_balita'){
          let link_id = dataObject.link_id
          let ress = await AdrCheckupBalita.findOne({
            raw: true,
            where: {
              id: link_id
            }
          })
          rating = ress.rating
        }else if(dataObject.page_link === 'laporan_lansia'){
          let link_id = dataObject.link_id
          let ress = await AdrCheckupLansia.findOne({
            raw: true,
            where: {
              id: link_id
            }
          })
          rating = ress.rating
        }else if(dataObject.page_link === 'laporan_ibu_hamil'){
          let link_id = dataObject.link_id
          let ress = await AdrCheckupIbuHamil.findOne({
            raw: true,
            where: {
              id: link_id
            }
          })
          rating = ress.rating
        }
      }
      hasil.push({
        id: data[i].id,
        account_id: data[i].account_id,
        group: data[i].group,
        title: data[i].title,
        message: data[i].message,
        page_link: data[i].page_link,
        data: data[i].data,
        rating: rating,
        created_dt: moment(data[i].created_dt).format('YYYY-MM-DD HH:mm:ss')
      })
    }

    let newRs = {
      rows: hasil,
      currentPage: page,
      totalPage: Math.ceil(rcount / limit),
      totalData: rcount
    };

    return res.status(200).json(rsmg(newRs))
    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error get list activity...', e)
    return utils.returnErrorFunction(res, 'error get list activity', e)
  }
}

exports.getIDCheckupBalita = async function(req, res){
  try{
    let id = req.body.id;

    let data = await AdrCheckupBalita.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    if(!data){
      return res.status(200).json(rsmg({}));
    }

    let hasil = {
      id: data.id,
      nama: data.nama,
      nik: data.nik,
      umur: data.umur,
      tgl_periksa: moment(data.tgl_periksa).format('YYYY-MM-DD'),
      berat_badan: data.berat_badan,
      ket_berat_badan: data.ket_berat_badan,
      tinggi_badan: data.tinggi_badan,
      ket_tinggi_badan: data.ket_tinggi_badan,
      lingkar_kepala: data.lingkar_kepala,
      ket_lingkar_kepala: data.ket_lingkar_kepala,
      jenis_imunisasi: data.jenis_imunisasi,
      catatan: data.catatan,
      obat: data.obat,
      orang_tua_kandung: data.orang_tua_kandung,
      tanggal_lahir: moment(data.tanggal_lahir).format('YYYY-MM-DD')
    }
    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error get checkup balita by id...', e)
    return utils.returnErrorFunction(res, 'error get checkup balita by id', e)
  }
}

exports.getIDCheckupIbuHamil = async function(req, res){
  try{
    let id = req.body.id;

    let data = await AdrCheckupIbuHamil.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    if(!data){
      return res.status(200).json(rsmg({}));
    }

    let hasil = {
      id: data.id,
      nama: data.nama,
      nik: data.nik,
      nama_suami: data.nama_suami,
      usia_hamil: data.usia_hamil,
      tanggal_periksa: moment(data.tanggal_periksa).format('YYYY-MM-DD'),
      berat_badan: data.berat_badan,
      tensi_darah: data.tensi_darah,
      ket_tensi_darah: data.ket_tensi_darah,
      lingkar_lengan_atas: data.lingkar_lengan_atas,
      ket_lingkar_lengan_atas: data.ket_lingkar_lengan_atas,
      denyut_jantung_bayi: data.denyut_jantung_bayi,
      ket_denyut_jantung_bayi: data.ket_denyut_jantung_bayi,
      tinggi_fundus: data.tinggi_fundus,
      ket_tinggi_fundus: data.ket_tinggi_fundus,
      catatan: data.catatan,
      obat: data.obat,
      account_id: data.account_id,
      tanggal_lahir: moment(data.tanggal_lahir).format('YYYY-MM-DD')
    }
    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error get checkup ibu hamil by id...', e)
    return utils.returnErrorFunction(res, 'error get checkup ibu hamil by id', e)
  }
}

exports.getIDCheckupLansia = async function(req, res){
  try{
    let id = req.body.id;

    let data = await AdrCheckupLansia.findOne({
      raw: true,
      where: {
        id: id
      }
    })

    if(!data){
      return res.status(200).json(rsmg({}));
    }

    let hasil = {
      id: data.id,
      nama: data.nama,
      nik: data.nik,
      umur: data.umur,
      jenis_kelamin: data.jenis_kelamin,
      tgl_periksa: moment(data.tgl_periksa).format('YYYY-MM-DD'),
      berat_badan: data.berat_badan,
      tinggi_badan: data.tinggi_badan,
      tensi_darah: data.tensi_darah,
      ket_tensi_darah: data.ket_tensi_darah,
      asam_urat: data.asam_urat,
      ket_asam_urat: data.ket_asam_urat,
      kolerstrol: data.kolerstrol,
      ket_kolerstrol: data.ket_kolerstrol,
      catatan: data.catatan,
      obat: data.obat,
      account_id: data.account_id,
      tanggal_lahir: moment(data.tanggal_lahir).format('YYYY-MM-DD')
    }
    return res.status(200).json(rsmg(hasil));
  }catch(e){
    logger.error('error get checkup lansia by id...', e)
    return utils.returnErrorFunction(res, 'error get checkup lansia by id', e)
  }
}

exports.logout = async function(req, res){
  try{
    let id = req.body.id;

    await user.update({
      device_id: null
    },{
      where: {
        id: id
      }
    })

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error logout...', e)
    return utils.returnErrorFunction(res, 'error logout', e)
  }
}

exports.saveFeedback = async function(req, res){
  try{
    let id = req.body.id;
    let type = req.body.type;
    let rating = req.body.rating;

    if(type === 'laporan_balita'){
      await AdrCheckupBalita.update({
        rating: rating
      },{
        where: {
          id: id
        }
      })  
    }
    if(type === 'laporan_lansia'){
      await AdrCheckupLansia.update({
        rating: rating
      },{
        where: {
          id: id
        }
      })
    }
    if(type === 'laporan_ibu_hamil'){
      await AdrCheckupIbuHamil.update({
        rating: rating
      },{
        where: {
          id: id
        }
      })
    }

    return res.status(200).json(rsmg());
  }catch(e){
    logger.error('error save feedback...', e)
    return utils.returnErrorFunction(res, 'error save feedback', e)
  }
}

exports.dataPengunjung = async function(req, res){
  try{
    let tgl_awal = req.body.tgl_awal;
    let tgl_akhir = req.body.tgl_akhir;

    let dataBalita = await AdrCheckupBalita.count({
      raw: true,
      where: sequelize.literal(`date(tgl_periksa) between '${moment(tgl_awal).format('YYYY-MM-DD')}' and '${moment(tgl_akhir).format('YYYY-MM-DD')}'`),
    })
    let dataLansia = await AdrCheckupLansia.count({
      raw: true,
      where: sequelize.literal(`date(tgl_periksa) between '${moment(tgl_awal).format('YYYY-MM-DD')}' and '${moment(tgl_akhir).format('YYYY-MM-DD')}'`),
    })
    let dataIbuHamil = await AdrCheckupIbuHamil.count({
      raw: true,
      where: sequelize.literal(`date(tanggal_periksa) between '${moment(tgl_awal).format('YYYY-MM-DD')}' and '${moment(tgl_akhir).format('YYYY-MM-DD')}'`),
    })
    return res.status(200).json(rsmg({
      dataBalita: dataBalita,
      dataLansia: dataLansia,
      dataIbuHamil: dataIbuHamil
    }));
  }catch(e){
    logger.error('error get data pengunjung...', e)
    return utils.returnErrorFunction(res, 'error get data pengunjung', e)
  }
}

exports.uploadFileSingle = async function (req, res) {
  try {
    let file = req.body.file;
    let key = req.body.key;
    let buf = Buffer.from(file,'base64')
    let filetype = await FileType.fromBuffer(buf);
    let ext = filetype.ext;
    let mime = filetype.mime;

    let upload = await s3.upload({
      ACL: 'public-read',
      Bucket: 'bucket-sit',
      Key: key,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: mime,
    }).promise();
    logger.debug('upload', upload)
    return res.status(200).json(rsmg(upload))
  } catch (e) {
    logger.error('error upload file...', e);
    return utils.returnErrorFunction(res, 'error upload file...', e.toString());
  }
};

exports.uploadFileMultipart = async function (req, res) {
  try {
    let statusPart;
    let partSize = 5 * 1024 * 1024; // Minimum 5MB per chunk
    let file = base64.returnBase64();
    let buffer = Buffer.from(file,'base64')
    let filetype = await FileType.fromBuffer(buffer);
    let ext = filetype.ext;
    let mime = filetype.mime;
    let name = moment().format('YYYYMMDDHHmmSSS');
    let bucket = 'bucket-sit';
    let key = `${ext}/${name}`;

    let numPartsLeft = Math.ceil(buffer.length / partSize);
    let partNum = 0;
    let multiPartParams = {
      ACL: 'public-read',
      Bucket: bucket,
      Key: key,
      ContentEncoding: 'base64',
      ContentType: mime
    };
    let multipart = await s3.createMultipartUpload({
      ACL: 'public-read',
      Bucket: bucket,
      Key: key,
      ContentEncoding: 'base64',
      ContentType: mime
    }).promise();
    let multipartMap = { Parts: [] };
    for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += partSize) {
      try{
        partNum += 1;
        let end = Math.min(rangeStart + partSize, buffer.length)
        let partParams = {
          Bucket: bucket,
          Key: key,  
          Body: buffer.slice(rangeStart, end),
          PartNumber: String(partNum),
          UploadId: multipart.UploadId
        };
        let result = await s3.uploadPart(partParams).promise();
        multipartMap.Parts[partNum - 1] = { ETag: result.ETag, PartNumber: Number(partNum) };
        let pp = Math.ceil((partNum / numPartsLeft) * 100);
        logger.debug(`sukses upload part ${partNum} with persentase ${pp}%`)
        statusPart = 1;
      }catch(e){
        logger.debug(`error muncul pada upload part...`, e)
        statusPart = 0;
        break;
      }
    }
    if(!statusPart){
      return res.status(200).json(rsmg());
    }
    let doneParams = { Bucket: bucket, Key: key, MultipartUpload: multipartMap, UploadId: multipart.UploadId };
    const result = await s3.completeMultipartUpload(doneParams).promise();
    return res.status(200).json(rsmg(result));
  } catch (e) {
    logger.error('error upload file v2...', e);
    return utils.returnErrorFunction(res, 'error upload file v2...', e.toString());
  }
};

exports.join = async function(req, res){
  try{
    let id_file = '2d941be4-5e80-4cbd-83c8-777475fd9a55';

    let data = await AdrFileChunk.findAll({
      raw: true,
      where: {
        id_file: id_file
      },
      order: [['created_dt', 'ASC']],
    })
    let body_buffer = "";
    for(let i=0; i<data.length; i++){
      let url = data[i].url_link;
      let response = await fetch(url);
      let body = await response.text();
      body_buffer += Buffer.from(body, 'base64').toString('binary')
      logger.debug(`done proses ke ${i+1}`)
    }

    const joinedBase64Result = Buffer.from(body_buffer.toString(), 'binary').toString('base64');
    return res.status(200).json(rsmg(joinedBase64Result));    
  }catch(e){
    logger.error('error join...', e);
    return utils.returnErrorFunction(res, 'error join...', e.toString());
  }
}

exports.uploadFileChunk = async function(req, res){
  try{
    logger.debug('payload received for uploadFileChunk...', JSON.stringify(req.body.mime))
    let id_file = req.body.id_file;
    let data = req.body.data;
    let key = req.body.key;
    let mime = req.body.mime;
    let buf = Buffer.from(data,'base64')

    let upload = await s3.upload({
      ACL: 'public-read',
      Bucket: 'bucket-sit-c58v4',
      Key: `${id_file}/${key}`,
      Body: buf,
      ContentEncoding: 'base64',
      ContentType: mime,
    }).promise();
    logger.debug('uploadFileChunk...', JSON.stringify(upload))

    await AdrFileChunk.create({
      id: uuidv4(),
      id_file: id_file,
      url_link: upload.Location,
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    })
    return res.status(200).json(rsmg(upload))
  }catch(e){
    logger.error('error uploadFileChunk...', e);
    return utils.returnErrorFunction(res, 'error uploadFileChunk...', e.toString());
  }
}

exports.listBucket = async function(req, res){
  try{
    let upload = await s3.listBuckets().promise();
    return res.status(200).json(rsmg(upload))
  }catch(e){
    logger.error('error list bucket...', e);
    return utils.returnErrorFunction(res, 'error list bucket...', e.toString());
  }
}

exports.paymentReceipt = async function(req, res){
  try{
    logger.debug(`payload received for paymentReceipt... ${JSON.stringify(req.body)}`)
    let opt = {
      height: '4.5in', width: '10.5in',
      border: {
        top: '0.1in',
        right: '0.1in',
        left: '0.1in',
        bottom: '0.1in'
      }
    };

    let headerKwintansi = {
      "header": {
        "code": "ESB-00-000",
        "message": "Request is successfully processed",
        "srcCode": "200",
        "srcMessage": "SUCCESS",
        "addInfo": {
          "requestId": "TEST-201904181418112234",
          "requestTimestamp": "2019-04-18 11:22:33",
          "refNo": "20231219113310803211773738865207",
          "srcTarget": "-"
        }
      },
      "data": {
        "noTrx": "021223R020915",
        "trxDate": "2023-10-02 00:00:00.0",
        "contNo": "021221418163",
        "custName": "SADIMO WARDIDJAH",
        "colaPlatNo": "-",
        "jthTempo": "03-Jul-2023",
        "sisaHutang": "1,609,997.00",
        "kumulatifDenda": "0",
        "lokasiPembayaran": "CIREBON-WAHIDIN",
        "namaPegawai": "TITAH NANDITHA",
        "terbilang": "Satu Juta Lima Ratus Tiga Puluh Sembilan Ribu Sembilan Ratus Lima Puluh Rupiah",
        "listBiaya": [
          {
            "jumlah": "805000",
            "keterangan": "001 PENERIMAAN ANGSURAN"
          },
          {
            "jumlah": "734950",
            "keterangan": "001 PENERIMAAN DENDA"
          }
        ],
        "total": "1539950"
      }
    }

    let htmlString = await pdfTemplate.getReceiptv3(headerKwintansi);
    let bufferResult = await utils.generatePDF(htmlString, opt);
    let buf = Buffer.from(bufferResult).toString('base64');

    return res.status(200).json(rsmg(buf))
  }catch(e){
    logger.error(`Error generate payment receipt ${e}`)
    return utils.returnErrorFunction(res, 'error generate payment receipt...', e);
  }
}

exports.paymentReceiptV2 = async function(req, res){
  try {
    const headerKwintansi = {
      "header": {
        "code": "ESB-00-000",
        "message": "Request is successfully processed",
        "srcCode": "200",
        "srcMessage": "SUCCESS",
        "addInfo": {
          "requestId": "TEST-201904181418112234",
          "requestTimestamp": "2019-04-18 11:22:33",
          "refNo": "20231219113310803211773738865207",
          "srcTarget": "-"
        }
      },
      "data": {
        "noTrx": "021223R020915",
        "trxDate": "2023-10-02 00:00:00.0",
        "contNo": "021221418163",
        "custName": "SADIMO WARDIDJAH",
        "colaPlatNo": "-",
        "jthTempo": "03-Jul-2023",
        "sisaHutang": "1,609,997.00",
        "kumulatifDenda": "0",
        "lokasiPembayaran": "CIREBON-WAHIDIN",
        "namaPegawai": "TITAH NANDITHA",
        "terbilang": "Satu Juta Lima Ratus Tiga Puluh Sembilan Ribu Sembilan Ratus Lima Puluh Rupiah",
        "listBiaya": [
          {
            "jumlah": "805000",
            "keterangan": "001 PENERIMAAN ANGSURAN"
          },
          {
            "jumlah": "734950",
            "keterangan": "001 PENERIMAAN DENDA"
          }
        ],
        "total": "1539950"
      }
    }
    const htmlString = await pdfTemplate.getReceiptv3(headerKwintansi);
    
    // Command to execute wkhtmltopdf
    const wkhtmltopdfCommand = `wkhtmltopdf - -`;

    // Execute wkhtmltopdf as a child process
    const childProcess = exec(wkhtmltopdfCommand, { encoding: 'base64' }, (error, stdout, stderr) => {
      if (error) {
        logger.error('Error generating PDF', error.toString())
        res.status(500).send({ error: error.toString() });
      } else {
        res.send(stdout);
      }
    });

    // Send HTML content to wkhtmltopdf via stdin
    childProcess.stdin.write(htmlString);
    childProcess.stdin.end();
  } catch (e) {
    logger.error('Internal server error - Error generating PDF', e.toString())
    res.status(500).send({ error: e.toString() });
  }
}