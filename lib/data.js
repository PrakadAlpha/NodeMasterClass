const fs = require('fs');
const path = require('path');
const helpers = require('./helpers')

let lib = {};

lib.baseDir = path.join(__dirname,'/../.data/');

lib.create = (dir,file,data,callback) => {

  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {

    if(!err && fileDescriptor){
      let stringData = JSON.stringify(data);

      fs.writeFile(fileDescriptor, stringData,(err) => {
        if(!err){
          fs.close(fileDescriptor,(err) => {
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};


lib.read =(dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8' ,(err, data) => {
    if(!err){
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    }else
      callback(err, data);
  });
};


lib.update = (dir, file, data, callback) => {

  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
    
    if(!err && fileDescriptor){
      
      let stringData = JSON.stringify(data);

      fs.truncate(fileDescriptor, (err) => {
        if(!err){
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if(!err){
              fs.close(fileDescriptor, (err) => {
                if(!err){
                  callback(false);
                }else
                  callback("Error closing file.");
              })
            }else
              callback("Error writing to file.")
          })
        }else
          callback("Error truncating file.")
      })
    }else
      callback("Could not open file, It may not exist.");
  });
}


lib.delete = (dir, file, callback) => {

  fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
    if(!err){
      callback(false);
    }else
      callback("Trouble deleting file");
  })

}

module.exports = lib;