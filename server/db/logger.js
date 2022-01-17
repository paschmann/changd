const db = require('./db');

module.exports = {
  logEvent: logEvent,
  logError: logError,
  getRecentLogs: getRecentLogs
};

function getRecentLogs(req, res, next) {
  db.any('select * from error_log order by error_date desc limit 10')
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(function (err) {
    console.log(err);
  });
}

function logEvent(data, userid) {
  db.none('insert into user_log (data, user_id) values ($1, $2)', [data, userid]);
  console.log(data);
}

function logError(error) {
  db.none('insert into error_log (error) values ($1)', error);
  console.log(error);
}