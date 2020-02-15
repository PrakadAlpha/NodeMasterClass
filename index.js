const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const env = require('./config');
const https = require('https');
const fs = require('fs');
// const _data = require('./lib/data');


// @TODO delete this
// _data.create('test', 'newFile', {'prakad':'alpha'}, (err) => {
//   console.log("This is the error: ",err);  
// }); 
// _data.read('test', 'newFile',(err, data) => {
//   console.log("This is the error: ",err, "this is the data: ", data);  
// }); 
// _data.update('test', 'newFile', {'keerthi':'babygirl'}, (err) => {
//   console.log("This is the error: ",err);  
// }); 
// _data.delete('test', 'newFile',(err) => {
//   console.log("This is the error: ",err);  
// }); 

let httpServer = http.createServer((req,res) => {
  unifiedServer(req, res);
});

// Start the server
httpServer.listen(env.httpPort,() => {
  console.log('Server is running on ' + env.httpPort + ' in a ' + env.envName + ' mode..');
});


httpsServerOptions = {
  'cert' : fs.readFileSync('./https/cert.pem'),
  'key' : fs.readFileSync('./https/key.pem')
}



let httpsServer = https.createServer(httpsServerOptions, (req,res) => {
  unifiedServer(req, res);
});

httpsServer.listen(env.httpsPort,() => {
  console.log('Server is running on ' + env.httpsPort + ' in a ' + env.envName + ' mode..');
});


function unifiedServer(req, res){

  // Parse the url
let parsedUrl = url.parse(req.url, true);

// Get the path
let path = parsedUrl.pathname;
let trimmedPath = path.replace(/^\/+|\/+$/g, '');

// Get the query string as an object
let queryString = parsedUrl.query;

// Get the HTTP method
let method = req.method.toLowerCase();

//Get the headers as an object
let headers = req.headers;

// Get the payload,if any
let decoder = new StringDecoder('utf-8');
let buffer = '';

req.on('data', function(data) {
    buffer += decoder.write(data);
});

req.on('end', function() {

    buffer += decoder.end();

    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    let data = {
      'trimmedPath' : trimmedPath,
      'queryString' : queryString,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){

      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof(payload) == 'object'? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: ",statusCode,payloadString);

    });

});


}


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

// Define the request router
let router = {
  'sample' : handlers.sample,
  'ping' : handlers.ping
};