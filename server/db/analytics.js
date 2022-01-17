
const db = require('./db');
var users = require('./users');
var logger = require('./logger');

module.exports = {
  getUsage: getUsage
};

function getUsage(req, res, next) {
  var userid = users.getUserID(req);

  if (req.query.status == "monthly") {
    db.task('grouped-activity', t => {
      return t.batch([
        t.any(`SELECT *
          FROM  (
             SELECT to_char(month::date, 'Month') as date, 'Checks' as name, to_char(month::date, 'MM') as MonthNo
             FROM   generate_series(timestamp '2021-01-01'
                                  , now()
                                  , interval  '1 month') month
             ) d
          LEFT   JOIN (
             SELECT to_char(date_trunc('month', datetime)::date, 'Month') AS date
                  , coalesce(count(*),0)::INTEGER AS Value
             FROM   history
             INNER JOIN JOBS using (job_id)
             WHERE
             history.status = 1
              AND datetime >= now() - '12 month'::interval
             AND    datetime <= now()
            AND user_id = $1
             GROUP  BY 1
             ) t USING (date)
          ORDER  BY monthno`, [userid]),
        t.any(`SELECT *
        FROM  (
           SELECT to_char(month::date, 'Month') as date, 'Changes' as name, to_char(month::date, 'MM') as MonthNo
           FROM   generate_series(timestamp '2021-01-01'
                                , now()
                                , interval  '1 month') month
           ) d
        LEFT   JOIN (
           SELECT to_char(date_trunc('month', datetime)::date, 'Month') AS date
                , coalesce(count(*),0)::INTEGER AS Value
           FROM   history
           INNER JOIN JOBS using (job_id)
           WHERE
           history.status = 2
            AND datetime >= now() - '12 month'::interval
           AND    datetime <= now()
          AND user_id = $1
           GROUP  BY 1
           ) t USING (date)
        ORDER  BY monthno`, [userid]),
      ]);
    })
      .then(function (data) {
        res.status(200).json(data[0].concat(data[1]));
      })
      .catch(function (err) {
        logger.logError('getJobDetail: ' + err);
        return next(err);
      });
  } else {
    db.task('grouped-activity', t => {
      return t.batch([
        t.any(`
        SELECT *
                  FROM  (
                     SELECT to_char(day::date, 'dd') as date, 'Checks' as name
                     FROM   generate_series(now() - '30 day'::interval
                                          , now()
                                          , interval  '1 day') day
                     ) d
                  LEFT   JOIN (
                     SELECT to_char(date_trunc('day', datetime)::date, 'dd') AS date
                          , coalesce(count(*),0)::INTEGER AS Value
                     FROM   history
                     INNER JOIN JOBS using (job_id)
                     WHERE
                     history.status = 1
                      AND datetime >= now() - '30 day'::interval
                     AND    datetime <= now()
                     AND user_id = $1
                     GROUP  BY 1
                     ) t USING (date)
                  ORDER  BY date`, [userid]),
        t.any(`SELECT *
        FROM  (
           SELECT to_char(day::date, 'dd') as date, 'Changes' as name
           FROM   generate_series(now() - '30 day'::interval
                                , now()
                                , interval  '1 day') day
           ) d
        LEFT   JOIN (
           SELECT to_char(date_trunc('day', datetime)::date, 'dd') AS date
                , coalesce(count(*),0)::INTEGER AS Value
           FROM   history
           INNER JOIN JOBS using (job_id)
           WHERE
           history.status = 2
            AND datetime >= now() - '30 day'::interval
           AND    datetime <= now()
            AND user_id = $1
           GROUP  BY 1
           ) t USING (date)
        ORDER  BY date`, [userid]),
      ]);
    })
      .then(function (data) {
        res.status(200).json(data[0].concat(data[1]));
      })
      .catch(function (err) {
        logger.logError('getJobDetail: ' + err);
        return next(err);
      });
  }
  
}