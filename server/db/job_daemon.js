var db = require('./db');
var notifications = require('./notifications');
const chromium = require('chrome-aws-lambda');
var logger = require('./logger');
const pixelmatch = require('pixelmatch');
const isReachable = require('is-reachable');
const filehandler = require('./file_handler');
const PNG = require('pngjs').PNG;
var jsdiff = require('diff');
const sharp = require('sharp');
const { json } = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const chrome_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];


module.exports = {
  runJob,
  executeVisualJob,
  executeXPathJob,
  executeAPIJob,
  getJobCheck,
  getWebsiteScreenshot,
  getWebsiteXPath,
  getAPIResponse,
  checkUrl,
  validUrl,
  previewXPathJob,
  previewAPIJob
}

function checkUrl(req, res, next) {
  var result = validUrl(req.query.url);
  res.status(200).json(result);
}


async function previewXPathJob(req, res, next) {
  var gotText = await getWebsiteXPath(req.query.url, req.query.xpath, 2);
  
  try {
    res.status(200).json(gotText);
  }
   catch(err) {
    res.status(500).json({
      message: 'Error getting XPath content',
      type: 'error'
    });
    logger.logError('previewXPathJob: ' + err);
  }
}


async function previewAPIJob(req, res, next) {
  var oJSON = await getAPIResponse(req.query.url);
  
  try {
    res.status(200).json(oJSON);
  } catch(err) {
    res.status(500).json({
      message: 'Error getting API response',
      type: 'error'
    });
    logger.logError('previewAPIJob: ' + err);
  }
}


async function validUrl(url) {
  //Not working in docker after a couple minutes for some reason
  //var exists = await isReachable(url);
  //return exists;
  return true;
}

function getJobCheck(req, res, next) {
  var dt = new Date();
  console.log("Job check running @ " + dt.toLocaleString());
  try {
    db.any('select * from jobs where status = 1 and next_run < now() and frequency > 0')
      .then(async function (data) {
        if (data.length > 0) {
          console.log("Running " + data.length + " checks ...")
        }
        var jobs_in_error = 0;
        for (const job of data) {
          // Check if job is continuously in error, if so, disable automatic checks, send email ...
          if (job.error_count > 10) {
            db.none('update jobs set status = 2, latest_error = \'Over 10 errors, disabling automatic checks\' where job_id = $1', [job.job_id]);
            jobs_in_error++;
            //Send notification email that job is not working
            notifications.sendTextMail(notification.param_1, "Change detected on " + job.job_name, "Change detected on " + job.job_name, html, "screenshots/" + job.job_id + "/" + newfilename + "_diff.png", "change");
          } else {
            console.log("Checking job: " + job.job_id + " - " + job.job_name);
            if (job.job_type === 0) {
              await executeVisualJob(job, job.diff_percent, "Cron");
            } else if (job.job_type === 1) {
              await executeXPathJob(job, "Cron");
            }
          }
        }
        jobs_in_error > 0 ? console.log(jobs_in_error + " jobs now errored out.") : console.log("");
      })
      .catch(function (err) {
        logger.logError('runJob: ' + err);
      });
  } catch (err) {
    console.log(err);
  }
  if (res) {
    res.status(200).json({ status: 'running' });
  }
}

function runJob(req, res, next) {
  db.one('select * from jobs where job_id = $1', [req.params.job_id])
    .then(async function (job) {
      var run_type;
      var diff_percent;
      if (req.query.type == "test") {
        run_type = "Test";
        diff_percent = 0;
      } else {
        run_type = "Run"
        diff_percent = job.diff_percent;
      }

      if (job.job_type === 0) {
        await executeVisualJob(job, diff_percent, run_type);
      } else if (job.job_type === 1) {
        await executeXPathJob(job, run_type);
      } else if (job.job_type === 2) {
        await executeAPIJob(job, run_type);
      }

      res.status(200).json({
        message: 'Completed',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('runJob: ' + err);
      return next(err);
    });
}

async function executeXPathJob(job, run_type) {
  try {
    var diff_percent = 0;

    // Fetch xPath value from URL
    var gotText = await getWebsiteXPath(job.url, job.xpath, job.delay);
    var diff = jsdiff.diffWords(gotText, job.latest_screenshot);
    var formattedText = "";
    
    diff.forEach(function(part){
      // green for additions, red for deletions
      // grey for common parts
        if (part.added) {
          formattedText += "<span style='background-color: #90EE90'>" + part.value + "</span>";
        } else if (part.removed) {
          formattedText += "<span style='background-color: #FF6347'>" + part.value + "</span>";
        } else {
          formattedText += "<span style='background-color: #FFFFFF'>" + part.value + "</span>";
        }
    });

    if (gotText && diff.length > 1) {
      diff_percent = 100;
    }

    if (gotText && (diff_percent > 0 || run_type === "Test")) {
      console.log("Changes detected ... saving to history and sending notifications ...");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, screenshot, diff_screenshot, source_screenshot, status, run_type)' +
            'values ($1, $2, $3, $4, $5, $6, $7)', [job.job_id, diff_percent, gotText, formattedText, job.latest_screenshot, 2, run_type]),
          t.none('update jobs set run_Count = run_count + 1, latest_screenshot = $2, last_run = now(), latest_success = now(), next_run = CASE WHEN $4 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $3 ' +
            'where job_id = $1', [job.job_id, gotText, diff_percent, run_type]),
          t.any('select * from user_notifications inner join job_notifications using (notification_id) where job_id = $1', job.job_id)
        ]);
      })
        .then(function (data) {
          try {
            var user_notifications = data[2];
            // Used for email notifications
            var html = notifications.getXPathChangeHtml();
            //replace handlebars
            var properties = {
              title: job.job_name,
              percent_change: diff_percent + "%",
              url: job.url,
              screenshot: job.latest_screenshot,
              screenshot_diff: gotText
            };
            html = notifications.replaceTextWithVariables(html, properties);

            user_notifications.forEach(notification => {
              if (notification.type == 'email') {
                notifications.sendTextMail(notification.param_1, "Change detected on " + job.job_name, "Change detected on " + job.job_name, html, job.latest_screenshot, formattedText, "change");
              }
            });
          }
          catch (err) {
            console.error(err);
          }
        })
        .catch(function (err) {
          logger.logError('executeXPathJob -> Send user notifications: ' + err);
        });

    } else if (gotText) {
      console.log("No changes detected");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, log, status, run_type)' +
            'values ($1, $2, $3, $4, $5)', [job.job_id, diff_percent, "No changes detected", 1, run_type]),
          t.none('update jobs set run_Count = run_count + 1, last_run = now(), next_run = CASE WHEN $3 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $2 ' +
            'where job_id = $1', [job.job_id, diff_percent, run_type])
        ]);
      });
    } else {
      console.log("Error: XPath unable to be captured");

      db.none('update jobs set last_run = now(), next_run = CASE WHEN $2 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, error_count = error_count + 1 ' +
        'where job_id = $1', [job.job_id, run_type])

      db.none('insert into history (job_id, log, change_percent, status, run_type)' +
        'values ($1, $2, $3, $4, $5)', [job.job_id, "Error, unable to capture XPath.", 0, 0, run_type]);
    }

  } catch (err) {
    console.log(err)
  }
}


async function executeAPIJob(job, run_type) {
  try {
    var diff_percent = 0;

    // Fetch xPath value from URL
    var oJSON = await getAPIResponse(job.url);
    var sJSON = JSON.stringify(oJSON);

    var sourceJSON = JSON.parse(job.latest_screenshot);
    var diff = jsdiff.diffJson(sourceJSON, oJSON);
    var formattedText = "";

    diff.forEach(function(part){
      // green for additions, red for deletions
      // grey for common parts
        if (part.added) {
          formattedText += "<span style='background-color: #90EE90'>" + part.value + "</span>";
        } else if (part.removed) {
          formattedText += "<span style='background-color: #FF6347'>" + part.value + "</span>";
        } else {
          formattedText += "<span style='background-color: #FFFFFF'>" + part.value + "</span>";
        }
    });

    if (oJSON && diff.length > 1) {
      diff_percent = 100;
    }

    if (oJSON && (diff_percent > 0 || run_type === "Test")) {
      console.log("Changes detected ... saving to history and sending notifications ...");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, screenshot, diff_screenshot, source_screenshot, status, run_type)' +
            'values ($1, $2, $3, $4, $5, $6, $7)', [job.job_id, diff_percent, sJSON, formattedText, job.latest_screenshot, 2, run_type]),
          t.none('update jobs set run_Count = run_count + 1, latest_screenshot = $2, last_run = now(), latest_success = now(), next_run = CASE WHEN $4 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $3 ' +
            'where job_id = $1', [job.job_id, sJSON, diff_percent, run_type]),
          t.any('select * from user_notifications inner join job_notifications using (notification_id) where job_id = $1', job.job_id)
        ]);
      })
        .then(function (data) {
          try {
            var user_notifications = data[2];
            // Used for email notifications
            var html = notifications.getXPathChangeHtml();
            //replace handlebars
            var properties = {
              title: job.job_name,
              percent_change: diff_percent + "%",
              url: job.url,
              screenshot: job.latest_screenshot,
              screenshot_diff: formattedText
            };
            html = notifications.replaceTextWithVariables(html, properties);

            user_notifications.forEach(notification => {
              if (notification.type == 'email') {
                notifications.sendTextMail(notification.param_1, "Change detected on " + job.job_name, "Change detected on " + job.job_name, html, job.latest_screenshot, formattedText, "change");
              }
            });
          }
          catch (err) {
            console.error(err);
          }
        })
        .catch(function (err) {
          logger.logError('executeAPIJob -> Send user notifications: ' + err);
        });

    } else if (oJSON) {
      console.log("No changes detected");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, log, status, run_type)' +
            'values ($1, $2, $3, $4, $5)', [job.job_id, diff_percent, "No changes detected", 1, run_type]),
          t.none('update jobs set run_Count = run_count + 1, last_run = now(), next_run = CASE WHEN $3 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $2 ' +
            'where job_id = $1', [job.job_id, diff_percent, run_type])
        ]);
      });
    } else {
      console.log("Error: API data unable to be captured or differences detected");

      db.none('update jobs set last_run = now(), next_run = CASE WHEN $2 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, error_count = error_count + 1 ' +
        'where job_id = $1', [job.job_id, run_type])

      db.none('insert into history (job_id, log, change_percent, status, run_type)' +
        'values ($1, $2, $3, $4, $5)', [job.job_id, "Error, unable to get API data", 0, 0, run_type]);
    }

  } catch (err) {
    console.log(err)
  }
}

async function getWebsiteXPath(url, xpath, delay) {
  try {
    const browser = await chromium.puppeteer.launch({
      args: chrome_args,
      executablePath: process.env.CHROME_BIN || await chromium.executablePath,
      headless: true,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    //Wait slightly longer just in case
    await new Promise(resolve => setTimeout(resolve, parseInt(delay * 1000)));

    const content = (await page.$x(xpath))[0];
    const text = await page.evaluate(el => {
        return el.textContent;
    }, content);

    await page.close();
    await browser.close();
    return text;
  } catch (err) {
    console.log('Unable to get website XPath: ' + err);
    return err;
  }
}


async function getAPIResponse(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log('Unable to get website XPath: ' + err);
    return "Error";
  }
}



async function executeVisualJob(job, diff_percent, run_type) {
  try {
    var newfilename = uniquefilename();

    // Get latest image reference from job table
    var filename1 = job.latest_screenshot;

    // Fetch the current image from the URL
    var gotImage = await getWebsiteScreenshot(job.url, "screenshots/" + job.job_id + "/", newfilename, job.delay);

    if (gotImage) {
      try {
        var objDiff = await compare("screenshots/" + job.job_id + "/" + filename1 + ".png", "screenshots/" + job.job_id + "/" + newfilename + ".png", "screenshots/" + job.job_id + "/" + newfilename + "_diff.png")
      } catch (err) {
        console.log('executeVisualJob -> Unable to compare images: ' + err);
      }
    } else {
      console.log("Unable to capture screenshot");
    }

    if (gotImage && objDiff) {
      console.log("Image difference to original: " + objDiff.diff_percent)
      console.log("Reason: " + objDiff.reason)
      console.log("Job threshold: " + diff_percent)
    }

    if (gotImage && objDiff && objDiff.diff_percent >= diff_percent) {
      console.log("Changes detected within threshold ... saving to history and sending notifications ...");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, screenshot, diff_screenshot, source_screenshot, status, run_type)' +
            'values ($1, $2, $3, $4, $5, $6, $7)', [job.job_id, objDiff.diff_percent, newfilename + ".png", newfilename + "_diff.png", filename1, 2, run_type]),
          t.none('update jobs set run_Count = run_count + 1, latest_screenshot = $2, last_run = now(), latest_success = now(), next_run = CASE WHEN $4 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $3 ' +
            'where job_id = $1', [job.job_id, newfilename, objDiff.diff_percent, run_type]),
          t.any('select * from user_notifications inner join job_notifications using (notification_id) where job_id = $1', job.job_id)
        ]);
      })
        .then(function (data) {
          var user_notifications = data[2];
          // Used for email notifications
          var html = notifications.getVisualChangeHtml();
          //replace handlebars
          var properties = {
            title: job.job_name,
            percent_change: objDiff.diff_percent + "%",
            url: job.url
          };
          html = notifications.replaceTextWithVariables(html, properties);

          user_notifications.forEach(notification => {
            //if (notification.type == 'smtp' ) {
              notifications.sendVisualMail(JSON.parse(notification.param_1), "Change detected on " + job.job_name, "Change detected on " + job.job_name, html, "screenshots/" + job.job_id + "/" + newfilename + "_diff.png", "screenshots/" + job.job_id + "/" + newfilename + "_small.png", "change");
            //}
          });

          // Delete old "latest_screenshot" since we just updated it.
          filehandler.deleteFile("screenshots/" + job.job_id + "/" + filename1 + ".png");


        })
        .catch(function (err) {
          logger.logError('executeVisualJob -> Send user notifications: ' + err);
        });

    } else if (gotImage && objDiff) {
      console.log("No changes detected within threshold");

      db.task('grouped-activity', t => {
        return t.batch([
          t.none('insert into history (job_id, change_percent, log, status, run_type)' +
            'values ($1, $2, $3, $4, $5)', [job.job_id, objDiff.diff_percent, "No changes detected within threshold.", 1, run_type]),
          t.none('update jobs set run_Count = run_count + 1, last_run = now(), next_run = CASE WHEN $3 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, latest_diff_percent = $2 ' +
            'where job_id = $1', [job.job_id, objDiff.diff_percent, run_type])
        ]);
      });

      //Delete new images since they are not needed
      filehandler.deleteFile("screenshots/" + job.job_id + "/" + newfilename + "_diff.png");
      filehandler.deleteFile("screenshots/" + job.job_id + "/" + newfilename + ".png");

    } else {
      console.log("Error: Image unable to be captured or differences detected.");

      db.none('update jobs set last_run = now(), next_run = CASE WHEN $2 = \'Cron\' THEN next_run + (frequency * interval \'1 minute\') ELSE now() + (frequency * interval \'1 minute\') END, error_count = error_count + 1 ' +
        'where job_id = $1', [job.job_id, run_type])

      db.none('insert into history (job_id, log, change_percent, status, run_type)' +
        'values ($1, $2, $3, $4, $5)', [job.job_id, "Error, unable to capture visual image of site.", 0, 0, run_type]);

      //Delete new images since they are not needed
      filehandler.deleteFile("screenshots/" + job.job_id + "/" + newfilename + "_diff.png");
      filehandler.deleteFile("screenshots/" + job.job_id + "/" + newfilename + ".png");
    }

  } catch (err) {
    console.log(err)
  }
}


async function getWebsiteScreenshot(url, dest, filename, delay) {
  try {
    console.log(url)
    const browser = await chromium.puppeteer.launch({
      args: chrome_args,
      executablePath: process.env.CHROME_BIN || await chromium.executablePath,
      headless: true,
      defaultViewport: { height: parseInt(process.env.CAPTURE_IMAGE_HEIGHT), width: parseInt(process.env.CAPTURE_IMAGE_WIDTH), }
    });
    const path = dest + filename + ".png";

    filehandler.checkDirectory(dest);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    //Wait slightly longer just in case
    await new Promise(resolve => setTimeout(resolve, parseInt(delay * 1000)));

    // Hopefully remove cookie consent box
    await page.evaluate(_ => {
      function xcc_contains(selector, text) {
        var elements = document.querySelectorAll(selector);
        return Array.prototype.filter.call(elements, function (element) {
          return RegExp(text, "i").test(element.textContent.trim());
        });
      }
      var _xcc;
      _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|Accept Cookies|Accept)$');
      if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
    });

    const $ele = await page.$('body');
    const { _, height } = await $ele.boundingBox();

    //await autoScroll(page);

    const data = await page.screenshot({
      fullPage: true
    });

    await filehandler.createFile(path, data);

    var smalldata;
    try {
      smalldata = await sharp(data)
        .resize(400)
        .toBuffer();
    } catch (err) {
      smalldata = data;
      console.log("Unable to resize website screenshot: " + err);
    }

    await filehandler.createFile(dest + filename + "_small.png", smalldata);

    await page.close();
    await browser.close();
    return true;
  } catch (err) {
    console.log('Unable to get website screenshot: ' + err);
    return false;
  }
}

async function autoScroll(page){
  await page.evaluate(() => new Promise((resolve) => {
    var scrollTop = -1;
    const interval = setInterval(() => {
      window.scrollBy(0, 100);
      if(document.documentElement.scrollTop !== scrollTop) {
        scrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve();
    }, 50);
  }));
}

async function compare(filename1, filename2, difffilename) {
  // filename1 / img1 = original screenshot, filename2 / img2 is new screenshot
  try {
    var img1 = await filehandler.getFile(filename1);
  } catch (err) {
    console.log("Image1" + err);
  }

  try {
    var img2 = await filehandler.getFile(filename2);
  } catch (err) {
    console.log("Image2" + err);
  }

  // Compare the width & height of img 1 vs img2. If they do not match, assume that there is a major change. 
  // We do this because pixelmatch requires images have the size dimensions in order
  // to compare them. This avoids us having huge images stored with fixed dimensions. 
  var numDiffPixels = 0;
  var diffPercent = 0;
  var diffReason = "Normal";

  try {
    if (img1.width !== img2.width || img1.height !== img2.height) {
      const { width, height } = img2;
      const diff = new PNG({ width, height });
      numDiffPixels = width * height;
      await filehandler.createFile(difffilename, PNG.sync.write(img2));
      diffPercent = ((numDiffPixels / (width * height)) * 100).toFixed(0);
      diffReason = "Image sizes do not match."
    } else {
      const { width, height } = img1;
      const diff = new PNG({ width, height });
      numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: parseFloat(process.env.PIXELMATCH_PROCESSING_THRESHOLD), diffColor: [0, 255, 0], alpha: parseFloat(process.env.PIXELMATCH_OUTPUT_ALPHA) });
      await filehandler.createFile(difffilename, PNG.sync.write(diff));
      diffPercent = ((numDiffPixels / (width * height)) * 100).toFixed(0);
      diffReason = "Pixel comparison"
    }
    
  } catch (err) {
    console.log("Error comparing images: " + err);
  }

  return {
    diff_pixels: numDiffPixels,
    diff_percent: diffPercent,
    reason: diffReason
  }
}

// Utils
function uniquefilename() {
  let r = Math.random().toString(36).substring(7);
  return r;
}