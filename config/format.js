'use-strict';

const moment = require('moment');
const logger = require('./logger');

exports.dateFormat = async function(date, type){
    try{
        const newDate = await moment(date).format(type);
        return newDate;
    } catch (e){
        logger.error('error formating date', e.toString());
        throw e;
    }
}

exports.rupiahFormat = async function(rupiah, elit){
    try{
        const newRupiah = 'Rp' + rupiah.toString().replace(/\B(?=(\d{3})+(?!\d))/g, `${elit}`)
        return newRupiah;
    } catch (e){
        logger.error('error formating rupiah', e.toString());
        throw e;
    }
}

exports.isValidateDate = async function(date)
{
    try{
        date = new Date(date);
        return date instanceof Date && !isNaN(date);
    }catch(e){
        logger.error(e);
        return false;
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
  