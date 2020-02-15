
const _data = require('./data');
const helpers = require('./helpers');
// Define all the handlers
let handlers = {};

// Sample handler
handlers.sample = (data,callback) => {
  callback(406,{'name':'sample handler'});
};

// Not found handler
handlers.notFound = (data,callback) => {
  callback(404);
};


handlers.ping = (data,callback) => {
  callback(200);
};

handlers.users = (data, callback) => {
  
  let availableMethods = ['post', 'get', 'put', 'delete'];

  if(availableMethods.indexOf(data.method) > -1){
      handlers._users[data.method](data, callback);
  }else{
    callback(405);
  }
};


handlers._users = {};

handlers._users.post = (data, callback) => {

  let firstname = typeof(data.payload.firstname) == 'string' && 
                  data.payload.firstname.trim().length > 0 ? 
                  data.payload.firstname.trim() : false;
  
  let lastname = typeof(data.payload.lastname) == 'string' && 
                  data.payload.lastname.trim().length > 0 ? 
                  data.payload.lastname.trim() : false;

  let phonenumber = typeof(data.payload.phonenumber) == 'string' && 
                  data.payload.phonenumber.trim().length == 10 ? 
                  data.payload.phonenumber.trim() : false;

  let password = typeof(data.payload.password) == 'string' && 
                  data.payload.password.trim().length > 0 ? 
                  data.payload.password.trim() : false;

  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && 
                  data.payload.tosAgreement == true ? 
                  true : false;

  if(firstname && lastname && phonenumber && password && tosAgreement){

    _data.read('users', phonenumber, (err, data) => {
      
      if(err){

        let hashedPassword = helpers.hash(password);

        if(hashedPassword){
          let userObject = {
            'firstname' : firstname,
            'lastname' : lastname,
            'phonenumber' : phonenumber,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };
  
          _data.create('users', phonenumber, userObject, (err) => {
  
            if(!err){
              callback(200);
            }else{
              console.log(err);            
              callback(500, {'Error' : 'Could not create user'});
            }
  
          }); 
        }else{
          callback(500, {'Error' : 'Not able to hash password.'});
        }
      }else{
        callback(400, {'Error':'User with phonenumber already exist.'});
      }
    });

  }else{
    callback(400, {'Error':'Missing required fields.'});
  }


}

handlers._users.get = (data, callback) => {

  let phone = typeof(data.queryString.phonenumber) == "string" && 
              data.queryString.phonenumber.trim().length == 10 ?
              data.queryString.phonenumber.trim() : false;

    if(phone){
      _data.read('users', phone, (err, data) => {
        if(!err && data){
          delete data.hashedPassword;
          callback(200, data);
        }else{
          callback(404, {'Error':'FileNotFound'});
        }
      })

    }else{
      callback(400, {'Error' : 'Not a valid phonenumber'});
    }

  
}

handlers._users.put = (data, callback) => {

  let phone = typeof(data.payload.phonenumber) == "string" && 
              data.payload.phonenumber.trim().length == 10 ?
              data.payload.phonenumber.trim() : false;

  let firstname = typeof(data.payload.firstname) == 'string' && 
              data.payload.firstname.trim().length > 0 ? 
              data.payload.firstname.trim() : false;

  let lastname = typeof(data.payload.lastname) == 'string' && 
              data.payload.lastname.trim().length > 0 ? 
              data.payload.lastname.trim() : false;

  let password = typeof(data.payload.password) == 'string' && 
              data.payload.password.trim().length > 0 ? 
              data.payload.password.trim() : false;

  if(phone){
    if(firstname || lastname || password){

      _data.read('users', phone, (err, data) => {
          if(!err && data){

            if(firstname){
              data.firstname = firstname;
            }
            if(lastname){
              data.lastname = lastname;
            }
            if(password){
              data.hashedPassword = helpers.hash(password);
            }

            _data.update('users', phone, data, (err) => {
              if(!err){
                callback(200);
              }else{
                callback(500, {'Error':'Could not update the user'});
              }
            });

          }else{
            callback(400, {'Error':'The specified user does not exist'});
          }
      });

    }else{
      callback(400, {'Error': 'Missing details to update'});
    }
  }else{
    callback(400, {'Error':'Missing required field'})
  }

}

handlers._users.delete = (data, callback) => {

  let phone = typeof(data.queryString.phonenumber) == "string" && 
              data.queryString.phonenumber.trim().length == 10 ?
              data.queryString.phonenumber.trim() : false;

  if(phone){

    _data.read('users', phone, (err, data) =>{
      if(!err && data){
        _data.delete('users', phone, (err) => {

          if(!err){
            callback(200);
          }else{
            callback(500, {'Error':'Not able to delete'});
          }

        });
      }else{
        callback(400, {'Error':'FileNotFound'});
      }
    });

  }else{
    callback(400, {'Error':'Missing required fields'});
  }

}

module.exports = handlers;