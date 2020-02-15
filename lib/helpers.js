
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


module.exports = helpers;