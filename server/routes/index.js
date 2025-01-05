var express = require('express');
var router = express.Router();

// ------- Core Imports
var users = require('../db/users');
var jobs = require('../db/jobs');
var analytics = require('../db/analytics');
var user_notifications = require('../db/user_notifcations');
var notifications = require('../db/notifications');
var job_daemon = require('../db/job_daemon');

router.get('/users', users.validateJWT, users.getAllUsers);
router.get('/users/me', users.validateJWT, users.getMyUser);
router.put('/users/:user_id', users.validateJWT, users.putUser);
router.get('/users/search', users.validateJWT, users.searchUsers);
router.get('/users/:user_id', users.validateJWT, users.getSingleUser);
router.delete('/users/:user_id', users.validateJWTAndCheckIsAdmin, users.removeUser);
router.post('/users/changepassword', users.validateJWT, users.changeUserPassword);
router.post('/users/forgotpassword', users.forgotUserPassword);
router.post('/users/setpassword', users.updateUserPassword);
router.post('/register', users.registerUser);
router.post('/login', users.loginUser);
router.get('/users/me/settings', users.validateJWT, users.getUserSettings);

router.get('/jobs', users.validateJWT, jobs.getJobs);
router.post('/jobs', users.validateJWT, jobs.postJob);
router.get('/screenshots/:job_id/:filename', jobs.getJobScreenshot);
router.get('/jobs/:job_id', users.validateJWT, jobs.getJobDetail);
router.put('/jobs/:job_id', users.validateJWT, jobs.putJob);
router.post('/jobs/:job_id/reset', users.validateJWT, jobs.resetJob);
router.put('/jobs/:job_id/status', users.validateJWT, jobs.putJobStatus);
router.delete('/jobs/:job_id', users.validateJWT, jobs.deleteJob);
router.delete('/jobs/:job_id/errors', users.validateJWT, jobs.resetErrorCount);

router.get('/timeline', users.validateJWT, jobs.getUserTimeline);
router.get('/analytics', users.validateJWT, analytics.getUsage);

router.get('/notifications', users.validateJWT, user_notifications.getNotifcations);
router.get('/notifications/:notification_id', users.validateJWT, user_notifications.getNotifcationDetail);
router.put('/notifications/:notification_id', users.validateJWT, user_notifications.putNotification);
router.post('/notifications', users.validateJWT, user_notifications.postNotification);
router.delete('/notifications/:notification_id', users.validateJWT, user_notifications.deleteNotification);

router.get('/checkjobs', job_daemon.getJobCheck);
router.get('/jobs/:job_id/run', users.validateJWT, job_daemon.runJob);
router.get('/util/checkurl', users.validateJWT, job_daemon.checkUrl);
router.get('/preview/xpath', users.validateJWT, job_daemon.previewXPathJob);
router.get('/preview/api', users.validateJWT, job_daemon.previewAPIJob);
router.get('/preview/html', users.validateJWT, job_daemon.previewHTMLJob);

router.get('/reach/providers', notifications.getReachProviders);
router.get('/reach/providers/:provider/parameters', notifications.getReachParameters);

module.exports = router;