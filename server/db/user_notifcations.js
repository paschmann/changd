const db = require('./db');
var logger = require('./logger');
var users = require('./users');
var notifications = require('./notifications');

module.exports = {
  getNotifcations,
  getNotifcationDetail,
  postNotification,
  deleteNotification,
  putNotification
};

function getNotifcations(req, res, next) {
  var userid = users.getUserID(req);
  db.any('select * from user_notifications where user_id = $1', [ userid])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getNotifcations: ' + err);
      return next(err);
    });
}

function getNotifcationDetail(req, res, next) {
  db.one('select * from user_notifications where notification_id = $1', [req.params.notification_id])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getNotifcations: ' + err);
      return next(err);
    });
}

function postNotification(req, res, next) {
    var userid = users.getUserID(req);
    db.none('insert into user_notifications (type, param_1, user_id, name)' +
    'values ($1, $2, $3, $4)', [req.body.type, req.body.param_1, userid, req.body.name])
        .then(function (data) {
          res.status(200).json({
            message: 'User Notification created',
            type: 'success'
          });
        })
        .catch(function (err) {
          logger.logError('postNotification: ' + err);
          res.status(200).json({
            message: 'Unable to create user notification',
            type: 'danger'
          });
        });
}

function deleteNotification(req, res, next) {
  db.none('delete from user_notifications where notification_id = $1', [req.params.notification_id])
    .then(function (resp) {
      db.none('delete from job_notifications where notification_id = $1', [req.params.notification_id]);
      res.status(200).json({
        message: 'User notification deleted',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('deleteNotification: ' + err);
      return next(err);
    });
}

function putNotification(req, res, next) {
  db.none('update user_notifications set param_1 = $1, name = $3 where notification_id = $2', [req.body.param_1, req.params.notification_id, req.body.name])
    .then(function (resp) {
      res.status(200).json({
        message: 'Notification updated',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('putNotification: ' + err);
      return next(err);
    });
}