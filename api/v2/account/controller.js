'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const mailer = require('../../../config/mailer');
const mailTemplate = require('./template/mail');
const adrVerifikasi = require('../../../model/adr_verifikasi');
const adrAccountModel = require('../../../model/adr_account');
const adrAccountLoginModel = require('../../../model/adr_account_login');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const connectionDB = require('../../../config/db').Sequelize;

exports.sendMail = async function (req, res) {
  try {
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
  } catch (e) {
    logger.error('error sendMail...', e);
    return utils.returnErrorFunction(res, 'error sendMail...', e);
  }
}

exports.parsingQRString = async function (req, res) {
  try {
    let rawQrisCode = req.body.rawQrisCode;

    const qrisStructureTagID = {
      '00': {
        varName: 'payloadFormatIndicator',
        name: 'Payload Format Indicator',
        format: 'N',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      '01': {
        varName: 'pointOfInitiationMethod',
        name: 'Point of Initiation Method',
        format: 'N',
        presence: 'O',
        allocation: 'S',
        structure: 'P'
      },
      '02-50': {
        varName: 'merchantAccountInformation',
        name: 'Merchant Account Information',
        format: 'ans',
        presence: 'M',
        allocation: 'D',
        structure: 'C'
      },
      51: {
        varName: 'merchantCategoryCodeStatic',
        name: 'Merchant Category Code (static)',
        format: 'N',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      52: {
        varName: 'merchantCategoryCode',
        name: 'Merchant Category Code',
        format: 'N',
        presence: 'M',
        allocation: 'S',
        structure: 'p'
      },
      53: {
        varName: 'transactionCurrency',
        name: 'Transaction Currency',
        format: 'N',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      54: {
        varName: 'transactionAmount',
        name: 'Transaction Amount',
        format: 'ans',
        presence: 'C',
        allocation: 'S',
        structure: 'P'
      },
      55: {
        varName: 'tipOrConvenienceIndicator',
        name: 'Tip or Convenience Indicator',
        format: 'N',
        presence: 'O',
        allocation: 'S',
        structure: 'P'
      },
      56: {
        varName: 'valueOfConvenienceFeeFixed',
        name: 'Value of Convenience Fee Fixed',
        format: 'ans',
        presence: 'C',
        allocation: 'S',
        structure: 'P'
      },
      57: {
        varName: 'valueOfConvenienceFeePercentage',
        name: 'Value of Convenience Fee Precentage',
        format: 'ans',
        presence: 'C',
        allocation: 'S',
        structure: 'P'
      },
      58: {
        varName: 'countryCode',
        name: 'Country Code',
        format: 'ans',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      59: {
        varName: 'merchantName',
        name: 'Merchant Name',
        format: 'ans',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      60: {
        varName: 'merchantCity',
        name: 'Merchant City',
        format: 'ans',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      },
      61: {
        varName: 'postalCode',
        name: 'Postal Code',
        format: 'ans',
        presence: 'O',
        allocation: 'S',
        structure: 'P'
      },
      62: {
        varName: 'addDataFieldTemplate',
        name: 'Add Data Field Template',
        format: 'S',
        presence: 'O',
        allocation: 'S',
        structure: 'C'
      },
      63: {
        varName: 'crc',
        name: 'CRC',
        format: 'ans',
        presence: 'M',
        allocation: 'S',
        structure: 'P'
      }
    };

    let qrisObject = {
      merchantPan: null,
    };
    let qrisCode = rawQrisCode;
    while (qrisCode.length >= 6) {
      const tagID = qrisCode.substring(0, 2);
      const length = parseInt(qrisCode.substring(2, 4));

      if (isNaN(length)) {
        throw '10004'
      }

      const value = qrisCode.substring(4, 4 + length);

      if (tagID in qrisStructureTagID) {
        qrisObject = {
          ...qrisObject,
          [qrisStructureTagID[tagID].varName]: {
            tagID,
            name: qrisStructureTagID[tagID].name,
            length,
            value
          }
        };
      } else {
        if (parseInt(tagID) >= 3 && parseInt(tagID) <= 50) {
          qrisObject = {
            ...qrisObject,
            merchantAccountInformation: {
              tagID,
              name: 'Merchant Account Information',
              length,
              value
            }
          };
        } else {
          qrisObject = {
            ...qrisObject,
            [tagID]: {
              tagID,
              length,
              value
            }
          };
        }
      }
      qrisCode = qrisCode.substring(4 + length);
    }
    if (qrisObject.merchantAccountInformation) {
      if (parseInt(qrisObject.merchantAccountInformation.tagID) >= 26 && parseInt(qrisObject.merchantAccountInformation.tagID) <= 45) {
        const indexMerchantPan = qrisObject.merchantAccountInformation.value.lastIndexOf('W') + 1;
        const lengthValueMerchant = qrisObject.merchantAccountInformation.value.length;
        const merchantValue = qrisObject.merchantAccountInformation.value.substring(indexMerchantPan, lengthValueMerchant);
        const lengthMerchantPan = parseInt(merchantValue.substring(4, 2));
        const merchantPan = merchantValue.substring(4).substring(0, lengthMerchantPan);
        qrisObject.merchantPan = merchantPan;
      }
    }

    return res.status(200).json(rsmg(qrisObject));
  } catch (e) {
    logger.error('error parsing qr string...', e);
    return utils.returnErrorFunction(res, 'error parsing qr string...', e);
  }
}

exports.registerAccount = async function (req, res) {
  let transaction = await connectionDB.transaction();
  try {
    const dateTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    const date = moment(dateTime).format('YYYYMM');
    let id = uuidv4();
    id = `${id}-${date}`;
    const nama = req.body.nama;
    const kk = req.body.kk
    const mobile_number = req.body.mobile_number;
    const email = req.body.email;
    const alamat = req.body.alamat;
    const blok = req.body.blok;
    const nomor_rumah = req.body.nomor_rumah;
    const rt = req.body.rt;
    const rw = req.body.rw;
    let pin = req.body.pin;
    pin = await bcrypt.hash(pin, saltRounds);

    const tabelAccount = adrAccountModel(date)
    const tabelAccountLogin = adrAccountLoginModel(date)

    const cekData = await connectionDB.query("SELECT * FROM adr_verifikasi WHERE kk = :kk_ FOR UPDATE",
    { replacements: { kk_: kk }, type: connectionDB.QueryTypes.SELECT, transaction: transaction },
    {
      raw: true
    });

    if (cekData.length > 0 && cekData[0].is_registered == 0) {
      const accountCreated = await tabelAccount.create({
        id: id,
        created_dt: dateTime,
        created_by: id,
        modified_dt: null,
        modified_by: null,
        is_deleted: 0,
        nama: nama,
        kk: kk,
        mobile_number: mobile_number,
        email: email,
        alamat: alamat,
        blok: blok,
        nomor_rumah: nomor_rumah,
        rt: rt,
        rw: rw
      }, { transaction: transaction })
  
      const accountLoginCreated = await tabelAccountLogin.create({
        id: uuidv4(),
        created_dt: dateTime,
        created_by: id,
        modified_dt: null,
        modified_by: null,
        is_deleted: 0,
        account_id: id,
        pin: pin,
        available_counter: null,
        next_available: null,
      }, { transaction: transaction })
  
      await adrVerifikasi.update({
        account_id: id,
        is_registered: 1
      }, {
        where : {
          id: cekData[0].id
        },
        transaction: transaction
      })

      let hasil = {
        accountCreated: accountCreated,
        accountLoginCreated: accountLoginCreated
      }
      await transaction.commit();
      return res.status(200).json(rsmg('000000', hasil));
    } else if (cekData.length > 0 && cekData[0].is_registered == 1) {
      await transaction.rollback();
      return res.status(200).json(rsmg('10006', null));
    } else {
      await transaction.rollback();
      return res.status(200).json(rsmg('10005', null));
    }
  } catch (e) {
    await transaction.rollback();
    logger.error('error POST /api/v2/account/register...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v2/account/register...', e);
  }
}

exports.getAccount = async function (req, res) {
  try {
    let id = req.body.id;
    const splitId = id.split('-');
    const splitIdLenght = splitId.length
    const partition = splitId[splitIdLenght - 1]

    const tabelAccount = adrAccountModel(partition)
    const tabelAccountLogin = adrAccountLoginModel(partition)

    const dataAccount = await tabelAccount.findOne({
      raw: true,
      where: {
        id: id
      }
    })
    if (!dataAccount) {
      return res.status(200).json(rsmg('10005', null));
    }

    const dataAccountLogin = await tabelAccountLogin.findOne({
      raw: true,
      where: {
        account_id: dataAccount.id
      }
    })

    const hasil = {
      dataAccount: dataAccount,
      dataAccountLogin: dataAccountLogin
    }
    return res.status(200).json(rsmg(hasil));
  } catch (e) {
    logger.error('error POST /api/v2/account...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v2/account...', e);
  }
}

exports.getLogin = async function (req, res) {
  try {
    const kk = req.body.kk;
    const pin = req.body.pin;

    let verifyKK = await adrVerifikasi.findOne({
      raw: true,
      where: {
        kk: kk
      }
    })

    if (!verifyKK) {
      return res.status(200).json(rsmg('10005', null));
    }
    if (verifyKK && verifyKK.is_registered == 0) {
      return res.status(200).json(rsmg('10005', null));
    }

    const account_id = verifyKK.account_id;
    const splitId = account_id.split('-');
    const splitIdLenght = splitId.length
    const partition = splitId[splitIdLenght - 1]

    const tabelAccount = adrAccountModel(partition)
    const tabelAccountLogin = adrAccountLoginModel(partition)

    let dataAccount = await tabelAccount.findOne({
      raw: true,
      where: {
        id: account_id
      }
    })
    if (!dataAccount) {
      return res.status(200).json(rsmg('10005', null));
    }

    let dataAccountLogin = await tabelAccountLogin.findOne({
      raw: true,
      where: {
        account_id: account_id
      }
    })
    if (!dataAccountLogin) {
      return res.status(200).json(rsmg('10005', null));
    }
    
    const payloadEnkripsiLogin = {
      id: dataAccountLogin.account_id,
      kk: dataAccount.kk,
      mobile_number: dataAccount.mobile_number
    }
    const pinRegistered = dataAccountLogin.pin;
    const checkPin = await bcrypt.compare(pin, pinRegistered);
    if (checkPin) {
      const hash = await utils.enkrip(payloadEnkripsiLogin);
      const token = await utils.signin(hash);

      res.set('Access-Control-Expose-Headers', 'access-token');
      res.set('access-token', token);

      return res.status(200).json(rsmg('000000', null))
    } else {
      res.set('Access-Control-Expose-Headers', 'access-token');
      res.set('access-token', '');
      return res.status(200).json(rsmg('10007', null))
    }
  } catch (e) {
    logger.error('error POST /api/v2/account/login...', e);
    res.set('Access-Control-Expose-Headers', 'access-token');
    res.set('access-token', '');
  return utils.returnErrorFunction(res, 'error POST /api/v2/account/login...', e);
  }
}