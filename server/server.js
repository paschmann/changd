var http = require('http');
var express = require('express');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var request = require('request');
var cors = require('cors');
var path = require('path');

require('dotenv').config();


var routes = require('./routes/index');
var db = require('./db/db');

var app = express();
app.use(cors());

// required in order to POST to express
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

app.use('/api/v1/', routes);

if (process.env.NODE_ENV !== 'dev') {
  app.use(function (err, req, res, next) {
    res.status(err.code || 500)
      .json({
        status: 'error',
        message: err
      });
  });
} else {
  // production error handler - no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
      .json({
        status: 'error',
        message: err.message
      });
  });
}

console.log("Backend environment: " + process.env.NODE_ENV);
console.log("API Service Running");
console.log("Port: " + process.env.API_PORT);
console.log("Mail System: " + process.env.MAILSYSTEM);
console.log("File System: " + process.env.FILESYSTEM);
console.log("Domain: " + process.env.DOMAIN);

checkDB();

const server = require('http').createServer(app);
server.listen(process.env.API_PORT);
module.exports = server;

function checkDB() {
  try {
    db.one('select current_schema(), current_database(), current_user')
      .then(function (data) {
        console.log('DB Connected: ' + JSON.stringify(data))
      })
      .catch(function (err) {
        console.log('DB Connection Error: ' + err)
      });
  } catch (err) {
    console.log(err);
  }
}
