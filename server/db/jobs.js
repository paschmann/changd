const db = require('./db');
var logger = require('./logger');
var users = require('./users');
var job_daemon = require('./job_daemon');
const filehandler = require('./file_handler');

module.exports = {
  getJobs,
  postJob,
  putJob,
  deleteJob,
  getJobDetail,
  putJobStatus,
  getUserTimeline,
  resetJob
};

function getJobs(req, res, next) {
  var userid = users.getUserID(req);
  var status = req.query.status;
  db.any('select * from jobs where user_id = $1 and status = $2 order by job_name', [userid, status])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getJobs: ' + err);
      return next(err);
    });
}

function getJobDetail(req, res, next) {
  db.task('grouped-activity', t => {
    return t.batch([
      t.one('select * from jobs where job_id = $1', [req.params.job_id]),
      t.any('select * from history where job_id = $1 order by datetime desc limit 50', [req.params.job_id]),
      t.any('select * from user_notifications inner join job_notifications using (notification_id) where job_id = $1', [req.params.job_id]),
    ]);
  })
    .then(function (data) {
      res.status(200).json({ jobDetail: data[0], jobHistory: data[1], jobNotifications: data[2] });
    })
    .catch(function (err) {
      logger.logError('getJobDetail: ' + err);
      return next(err);
    });
}


function getUserTimeline(req, res, next) {
  var userid = users.getUserID(req);
  db.any('select * from jobs inner join history using (job_id) where user_id = $1 order by datetime desc limit 100', [userid])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getUserTimeline: ' + err);
      return next(err);
    });
}

async function postJob(req, res, next) {
  var isValidUrl = await job_daemon.validUrl(req.body.url);

  if (isValidUrl) {
    var userid = users.getUserID(req);
    var filename = uniquefilename();

    if (req.body.frequency < 60) {
      req.body.frequency = 60;
    }
    db.one('insert into jobs (job_name, url, user_id, frequency, next_run, latest_screenshot, job_type, xpath, delay)' +
      'values ($1, $2, $3, $4, current_timestamp + (' + req.body.frequency + ' * interval \'1 minute\'), $5, $6, $7, $8) returning *', [req.body.job_name, req.body.url, userid, req.body.frequency, filename, req.body.job_type, req.body.xpath, req.body.delay])
      .then(async function (data) {
        req.body.notifications.forEach(notification_id => {
          //insert into notifications table
          db.none('insert into job_notifications (job_id, notification_id, user_id)' +
            'values ($1, $2, $3)', [data.job_id, notification_id, userid]);
        });

        res.status(200).json({
          message: 'Job created',
          type: 'success'
        });

        if (req.body.job_type === "0") {
          job_daemon.getWebsiteScreenshot(req.body.url, "screenshots/" + data.job_id + "/", filename);
        } else if (req.body.job_type === "1") {
          //Get XPath Ref Value write to latest screenshot
          var value = await job_daemon.getWebsiteXPath(req.body.url, req.body.xpath);
          //Update job record to have latest xpath value
          db.none('update jobs set latest_screenshot = $1 where job_id = $2', [value, data.job_id]);
        } else if (req.body.job_type === "2") {
          //Get API response write to latest screenshot
          var value = await job_daemon.getAPIResponse(req.body.url);
          //Update job record to have latest xpath value
          db.none('update jobs set latest_screenshot = $1 where job_id = $2', [JSON.stringify(value), data.job_id]);
        }
      })
      .catch(function (err) {
        logger.logError('postJob: ' + err);
        res.status(200).json({
          message: 'Unable to create Job',
          type: 'danger'
        });
      });
  } else {
    res.status(500).json({
      message: 'Job not updated, URL is not reachable',
      type: 'error'
    });
  }
}

function uniquefilename() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

async function resetJob(req, res, next) {
  try {
    var reference;
    var result;
    if (req.body.job_type == 0) {
      reference = uniquefilename();
      result = await job_daemon.getWebsiteScreenshot(req.body.url, "screenshots/" + req.params.job_id + "/", reference);
    } else if (req.body.job_type == 1) {
      result = await job_daemon.getWebsiteXPath(req.body.url, req.body.xpath);
      reference = result;
    } else if (req.body.job_type == 2) {
      result = await job_daemon.getAPIResponse(req.body.url);
      reference = result;
    }

    if (result) {
      db.none('update jobs set latest_screenshot = $1, next_run = now() + (frequency * interval \'1 minute\') where job_id = $2', [reference, req.params.job_id]);
      res.status(200).json({
        message: 'Reference updated',
        type: 'success'
      });
    } else {
      res.status(500).json({
        message: 'Reference not updated',
        type: 'error'
      });
    }
  } catch (err) {
    console.log(err);
  }
}

function putJobStatus(req, res, next) {
  db.none('update jobs set status = $1, error_count = 0 where job_id = $2', [req.body.status, req.params.job_id])
    .then(function (resp) {
      res.status(200).json({
        message: 'Status updated',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('putJobStatus: ' + err);
      return next(err);
    });
}


async function putJob(req, res, next) {
  var userid = users.getUserID(req);
  var isValidUrl = await job_daemon.validUrl(req.body.url);
  if (req.body.frequency < 60) {
    req.body.frequency = 60;
  }
  if (isValidUrl) {
    db.none('update jobs set job_name = $1, frequency = $2, diff_percent = $3, error_count = 0, latest_error = null, next_run = current_timestamp + ($2 * interval \'1 minute\'), url = $5, xpath = $6, delay = $7 '
      + ' where job_id = $4', [req.body.job_name, req.body.frequency, req.body.diff_percent, req.params.job_id, req.body.url, req.body.xpath, req.body.delay])
      .then(function (resp) {
        res.status(200).json({
          message: 'Job updated',
          type: 'success'
        });

        //delete existing notifications
        db.none('delete from job_notifications ' +
          'where job_id = $1 and user_id = $2', [req.params.job_id, userid]);

        req.body.notifications.forEach(notification_id => {
          //insert into notifications table
          db.none('insert into job_notifications (job_id, notification_id, user_id)' +
            'values ($1, $2, $3)', [req.params.job_id, notification_id, userid]);
        });
      })
      .catch(function (err) {
        logger.logError('putJob: ' + err);
        return next(err);
      });
  } else {
    res.status(500).json({
      message: 'Job not updated, URL is not reachable',
      type: 'error'
    });
  }

}

function deleteJob(req, res, next) {
  var userid = users.getUserID(req);

    try {
      filehandler.deleteFolder("screenshots/" + req.params.job_id + "/");
    }
    catch (err) {
      logger.logError('unable to delete screenshots folder for Job ID: ' + req.params.job_id + ' Err: ' + err);
      return next(err);
    }


    db.task('grouped-activity', t => {
      return t.batch([
        t.none('delete from jobs where job_id = $1 and user_id = $2', [req.params.job_id, userid]),
        t.none('delete from history where job_id = $1', [req.params.job_id]),
        t.none('delete from job_notifications where job_id = $1 and user_id = $2', [req.params.job_id, userid])
      ]);
    })
    .then(function (data) {
      //Delete all screenshots related to job?

      res.status(200).json({
        message: 'Job deleted',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('deleteJob: ' + err);
      return next(err);
    });
}
