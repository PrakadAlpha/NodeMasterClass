
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

handlers.tokens = (data, callback) => {
  
  let availableMethods = ['post', 'get', 'put', 'delete'];

  if(availableMethods.indexOf(data.method) > -1){
      handlers._tokens[data.method](data, callback);
  }else{
    callback(405);
  }
};

handlers._tokens = {};

handlers._tokens.post  = (data, callback) => {

  let phone = typeof(data.payload.phonenumber) == "string" && 
              data.payload.phonenumber.trim().length == 10 ?
              data.payload.phonenumber.trim() : false;

  let password = typeof(data.payload.password) == 'string' && 
                  data.payload.password.trim().length > 0 ? 
                  data.payload.password.trim() : false;

  if(phone && password){

    _data.read('users', phone, (err, data) => {

      if(!err){
        
        let hashedPassword = helpers.hash(password);
        
        if(data.hashedPassword == hashedPassword){

          let tokenId = helpers.createRandomToken(20);
          let expires = Date.now() * 1000 * 60 * 60;
          let tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          }

          _data.create('tokens', tokenId, tokenObject, (err, data) => {

            if(!err){
              callback(200, tokenObject);
            }else{
              callback(500, {'Error':'Not able to create file'});
            }

          });

        }else{
        callback(400, {'Error':'Wrong passoword'});
        }
      }else{
        callback(400, {'Error':'Cannot Find User'});
      }
    });

  }else{
    callback(400, {'Error':'Required fields missing'});
  }

}

handlers._tokens.get  = (data, callback) => {


  let id = typeof(data.queryString.id) == "string" && 
              data.queryString.id.trim().length == 20 ?
              data.queryString.id.trim() : false;

    if(id){
      _data.read('tokens', id, (err, data) => {
        if(!err && data){
          callback(200, data);
        }else{
          callback(404, {'Error':'Id Not Found'});
        }
      })

    }else{
      callback(400, {'Error' : 'Not a valid tokeId'});
    }

}

handlers._tokens.put  = (data, callback) => {

  let id = typeof(data.payload.id) == "string" && 
            data.payload.id.trim().length == 20 ?
            data.payload.id.trim() : false;

  let extend = typeof(data.payload.expires) == 'string' && 
                data.payload.expires.trim().length > 0 ? 
                data.payload.expires.trim() : false;

  if(id && extend){

    _data.read('tokens', id, (err, data) => {
      if(!err && data){

        if(data.expires > Date.now()){
          
           data.expires = Date.now() * 1000 * 60 * 60;
           
           _data.update('tokens', id, data, (err) => {
            if(!err){
              callback(200);
            }else{
              callback(500, {'Error' : 'Not able to update'});
            }
           });

        }else{
          callback(400, {'Error' : 'Already Expired'});
        }
      }else{
      callback(400, {'Error' : 'Not a valid tokeId'});
      }

    });

  }else{
    callback(400, {'Error' : 'Missing fields'}); 
  }

}

handlers._tokens.delete  = (data, callback) => {



  let id = typeof(data.queryString.id) == "string" && 
              data.queryString.id.trim().length == 20 ?
              data.queryString.id.trim() : false;

  if(id){

    _data.read('tokens', id, (err, data) =>{
      if(!err && data){

        _data.delete('tokens', id, (err) => {

          if(!err){
            callback(200);
          }else{
            callback(500, {'Error':'Not able to delete token'});
          }

        });
      }else{
        callback(400, {'Error':'Token Not Found'});
      }
    });

  }else{
    callback(400, {'Error':'Missing required fields'});
  }


}


module.exports = handlers;