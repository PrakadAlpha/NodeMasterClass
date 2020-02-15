
const crypto = require('crypto');
const config = require('../config');


let helpers = {};

helpers.hash = (str) => {

  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  }else{
    return false;
  }

}

helpers.parseJsonToObject = (buffer) => {
  try{
    return JSON.parse(buffer);
  }catch{
    return {};
  }
}

helpers.createRandomToken = (strLen) => {

  strLen = typeof(strLen) == "number" && strLen > 0 ? strLen : false;

  if(strLen){

    let possibleChars = 'abcdfghijklmnopqrstuvwxyz0123456789';

    let str = '';

    for(i = 1; i <= strLen; i++){
      let randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
      str += randomChar;
    }

    return str;

  }else{
    return false;
  }

}

module.exports = helpers;