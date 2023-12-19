'use-strict';

const moment = require('moment');
const logger = require('./logger');
const dateFormat = require('dateformat');

exports.dateFormat = async function(date, type){
    try{
        const newDate = await moment(date).format(type);
        return newDate;
    } catch (e){
        logger.error({message: 'Error formating date', error: e});
        throw e;
    }
}

exports.rupiahFormat = async function(rupiah, elit){
    try{
        const newRupiah = 'Rp ' + rupiah.toString().replace(/\B(?=(\d{3})+(?!\d))/g, `${elit}`)
        return newRupiah;
    } catch (e){
        logger.error({message: 'error formating rupiah', error: e});
        return 'Rp 0'
    }
}

exports.isEmpty = async function (data) {
    if(typeof(data) === 'object'){
        if(JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]'){
            return true;
        }else if(!data){
            return true;
        }
        return false;
    }else if(typeof(data) === 'string'){
        if(!data.trim()){
            return true;
        }
        return false;
    }else if(typeof(data) === 'undefined'){
        return true;
    }else{
        return false;
    }
}

exports.dateFormatIndo = async function(date){
  try {
    const dateObj = moment(date).locale("id");
    if (!dateObj.isValid()) {
      throw new Error('Invalid date');
    }
    const newDate = dateObj.format('DD-MMMM-YYYY');
    return newDate;
  } catch (e) {
    logger.error({message: 'error formatting date', error: e});
    return '-';
  }
  // try {
  //   let dates = new Date(date).toLocaleDateString();
  //   dates = dateFormat(dates, "yyyy-mm-dd");
  //   let oldmonth = moment(dates).format('MM');
  //   oldmonth = parseInt(oldmonth);
  //   let newmonth;
  //   switch (oldmonth) {
  //     case '01' || 1:
  //       newmonth = "Januari";
  //       break;
  //     case '02' || 2:
  //       newmonth = "Februari";
  //       break;
  //     case '03' || 3:
  //       newmonth = "Maret";
  //       break;
  //     case '04' || 4:
  //       newmonth = "April";
  //       break;
  //     case '05' || 5:
  //       newmonth = "Mei";
  //       break;
  //     case '06' || 6:
  //       newmonth = "Juni";
  //       break;
  //     case '07' || 7:
  //       newmonth = "Juli";
  //       break;
  //     case '08' || 8:
  //       newmonth = "Agustus";
  //       break;
  //     case '09' || 9:
  //       newmonth = "September";
  //       break;
  //     case '10' || 10:
  //       newmonth = "Oktober";
  //       break;
  //     case '11' || 11:
  //       newmonth = "November";
  //       break;
  //     case '12' || 12:
  //       newmonth = "Desember";
  //       break;
  //     default:
  //       throw '-';
  //   }
  //   let newDate = `${moment(dates).format('DD')} ${newmonth} ${moment(dates).format('YYYY')}`;
  //   return newDate;
  // } catch (e) {
  //   logger.error('error formating date', e.toString());
  //   return '-';
  // }
}