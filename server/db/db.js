var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

if (process.env.NODE_ENV === 'dev') {
  options.query = function(e) {
      console.log(" ");
      console.log(" ");
      console.log(e.query); //Logs all SQL to console
      console.log(" ");
      console.log(" ");
  }
}

options.schema = process.env.DB_SCHEMA;

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;
var db = pgp(connectionString);

module.exports = db;
