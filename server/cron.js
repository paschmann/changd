var dotenv = require('dotenv');
dotenv.config()

var cron = require('cron').CronJob;
var job_daemon = require('./db/job_daemon');

module.exports = {
    runJobCheck
};

console.log("Backend environment: " + process.env.NODE_ENV);
console.log("Cron Service Running");

runJobCheck();

function runJobCheck() {
    new cron('0 */1 * * * *', async function () {
      job_daemon.getJobCheck();
    }, null, true, 'America/Los_Angeles');
}