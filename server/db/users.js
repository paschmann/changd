var db = require('./db');
var logger = require('./logger');
var notifications = require('./notifications');
var filehandler = require('./file_handler');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var moment = require('moment');
var request = require('request');
var crypto = require('crypto');
var Chance = require('chance');

chance = new Chance();

module.exports = {
  getSingleUser,
  registerUser,
  updateUser,
  removeUser,
  loginUser,
  searchUsers,
  updateUserPassword,
  forgotUserPassword,
  getMyUser,
  validateJWT,
  validateJWTAndCheckIsAdmin,
  changeUserPassword,
  getUserID,
  getAllUsers,
  deleteUserStatus,
  putUserStatus,
  putUser,
  getUserSettings
};

function getUserID(req) {
  try {
    var response;
    if (req.header('Authorization') !== undefined) {
      var token = req.header('Authorization').split(' ')[1];
      var payload = jwt.decode(token, process.env.TOKEN_SECRET);
      response = payload.sub;
    } else {
      response = "";
    }
    return response;
  } catch (err) {
    console.log('getUserID: ' + err);
  }
}

function getUserSettings (req, res, next) {
  const settings = {
    filepath: filehandler.createFilePath("")
  }
  res.status(200).json(settings);
}

function validateJWT(req, res, next) {
  try {
    if (req.header('Authorization') !== undefined) {
      var token = req.header('Authorization').split(' ')[1];
      
      var payload = jwt.decode(token, process.env.TOKEN_SECRET);
      if (!payload || !payload.sub) {
        return res.status(403).json({ "data": "Unauthorized" });
      }

      req.user_id = payload.sub;
      next();
    } else {
      res.status(401).json({ "data": "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ "data": "Unauthorized" });
  }
};

function validateJWTAndCheckIsAdmin(req, res, next) {
  try {
    if (req.header('Authorization') !== undefined) {
      var token = req.header('Authorization').split(' ')[1];

      var payload = jwt.decode(token, process.env.TOKEN_SECRET);
      if (!payload || !payload.sub) {
        return res.status(403).json({ "data": "Unauthorized" });
      }

      req.user_id = payload.sub;
      next();
    } else {
      res.status(401).json({ "data": "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ "data": "Unauthorized" });
  }
};


function updateUserPassword(req, res, next) {
  var password = saltPassword(req.body.password);
  db.result("update users set password=$1, reset_password_token = null, reset_password_expires = null where reset_password_token=$2 and now() < reset_password_expires", [password, req.body.token])
    .then(function (data) {
      if (data.rowCount > 0) {
        res.status(200).json({
          status: 'success',
          message: 'Successfully updated your account, please login'
        });
      } else {
        res.status(200).json({
          status: 'failed',
          message: 'Unable to update your password. Please contact support.'
        });
      }

    })
    .catch(function (err) {
      logger.logError('updateUserPassword: ' + err);
      res.status(500).json(err);
    });
}

function changeUserPassword(req, res, next) {
  try {
    var userid = getUserID(req);
    var password = saltPassword(req.body.password);
    db.result("update users set password=$1 where user_id=$2", [password, userid])
      .then(function (data) {
        if (data.rowCount > 0) {
          res.status(200).json({
            status: 'success',
            message: 'Successfully updated your account'
          });
        } else {
          res.status(200).json({
            status: 'failed',
            message: 'Unable to update your password. Please contact support.'
          });
        }

      })
      .catch(function (err) {
        logger.logError('updateUserPassword: ' + err);
        res.status(500).json(err);
      });
  } catch (err) {
    console.log(err);
  }
}

function forgotUserPassword(req, res, next) {
  //Check if email is valid ....
  db.any('select user_id, email from users where email = $1', req.body.email)
    .then(function (user) {
      if (user.length > 0) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          db.none("update users set reset_password_token=$1, reset_password_expires= now() + '1 hour'::interval where user_id = $2", [token, user[0].user_id])
            .then(function () {
              var html = notifications.getResetPasswordHtml();
              //replace handlebars
              var properties = {
                title: "Reset your Changd password",
                token: token
              };
              html = notifications.replaceTextWithVariables(html, properties);
              notifications.sendTextMail(user[0].email, "Click here " + process.env.DOMAIN + "/setpassword?token=" + token + "\n\n to reset your password.", "Reset your Changd password", html, "", "resetpassword");
              res.status(200).json({
                status: 'success'
              });
            })
            .catch(function (err) {
              logger.logError('forgotUserPassword: ' + err);
              res.status(500).json(err);
            });
        });
      } else {
        res.status(200).json({
          status: 'success'
        });
      }
    });
}

/**
 * @swagger
 * /users/search:
 *  get:
 *   description: This should return a list of users using the query param of searchterm
 *   tags:
 *    - Users
 *   parameters:
 *    - in: query
 *      name: searchterm
 *   responses:
 *    200:
 *     description: Returns an array of users
 */
function searchUsers(req, res, next) {
  var searchterm = '%' + req.query.search_term + '%';
  db.any("select firstname, lastname, email user_id, status from users where firstname ilike $1 or lastname ilike $1 or email ilike $1", [ searchterm ])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      res.status(500).json(err);
    });
}

/**
 * @swagger
 * /users/me:
 *  get:
 *   description: This should return the logged in user
 *   tags:
 *    - Users
 *   responses:
 *    200:
 *     description: Returns the logged in user
 */
function getMyUser(req, res, next) {
  var userid = getUserID(req);
  if (userid !== "") {
    db.one('select user_id, email, firstname, lastname, account_type from users where user_id = $1', userid)
      .then(function (data) {
        updateUserLoginDate(userid);
        data.emailMD5 = crypto.createHash('md5').update(data.email).digest("hex")
        res.status(200).json(data);
      })
      .catch(function (err) {
        console.log('getMyUser: ' + err);
        res.status(500).json(err);
      });
  } else {
    res.status(200).json({ "data": "User not logged in" });
  }
}

function putUserStatus(req, res, next) {
  db.none('update users set status = 1 where user_id = $1', [req.params.user_id])
    .then(function (resp) {
      res.status(200).json({
        message: 'User set as active',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('putUserStatus: ' + err);
      return next(err);
    });
}

function deleteUserStatus(req, res, next) {
  db.none('update users set status = 0 where user_id = $1', [req.params.user_id])
    .then(function (resp) {
      res.status(200).json({
        message: 'User set as inactive',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('deleteUserStatus: ' + err);
      return next(err);
    });
}

function getSingleUser(req, res, next) {
  db.one('select firstname, lastname, email, status, user_id where user_id = $1', req.params.user_id)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getSingleUser: ' + err);
      res.status(500).json(err);
    });
}


function getAllUsers(req, res, next) {
  var where = req.query.status == "1" ? " where status = 1" : "";
  db.any('select firstname, lastname, email, status, user_id from users' + where)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      logger.logError('getAllUsers: ' + err);
      res.status(500).json(err);
    });
}

function registerUser(req, res, next) {
      db.any('select user_id from users where email = $1', req.body.email)
        .then(function (existingUser) {
          if (existingUser.length > 0) {
            return res.status(409).json({
              type: 'danger',
              message: 'Email is already taken'
            });
          } else {
            var password = saltPassword(req.body.password);
            db.any('insert into users(firstname, lastname, email, password)' +
              'values ($1, $2, $3, $4) RETURNING user_id', [req.body.firstname, req.body.lastname, req.body.email, password])
              .then(function (data) {
                var user = {
                  user_id: data[0].user_id,
                  firstname: req.body.firstname,
                  lastname: req.body.lastname
                };
                var token = createJWT({ user_id: data[0].user_id });
                user.token = token;
                res.status(200).json(user);
              })
              .catch(function (err) {
                logger.logError('registerUser: ' + err);
                res.status(500).json({
                  message: 'Unable to register user: ' + err,
                  type: 'danger'
                });
              });
          }
        });
}

function loginUser(req, res, next) {
  //User type = 0 = employee, supervisor = 1, admin = 2
  try {
    var email = req.body.email;
    var password = req.body.password;
    var errorMsg = "Invalid email and/or password";
    if (email !== undefined && password !== undefined) {
      db.one('select email, firstname, lastname, password, user_id from users where LOWER(email) = $1', email.toLowerCase())
        .then(function (data) {
          if (!bcrypt.compareSync(password, data.password)) {
            logger.logError('loginUser: Password comparesync error');
            res.status(401).json({
              message: errorMsg
            });
          } else {
            var user = {
              firstname: data.firstname,
              lastname: data.lastname,
              user_id: data.user_id
            };
            var token = createJWT({ user_id: data.user_id });
            user.token = token;
            updateUserLoginDate(data.user_id);
            res.status(200).json(user);
          }
        })
        .catch(function (err) {
          logger.logError('loginUser: ' + err);
          res.status(401).json({
            message: errorMsg
          });
        });
    }
  } catch (err) {
    console.log(err);
  }
}

function updateUserLoginDate(userid) {
  db.none('update users set last_login = now() where user_id = $1', userid);
}

function updateUser(req, res, next) {
  var userid = getUserID(req);
  db.one('select user_id from users where user_id = $1', userid)
    .then(function (user) {
      db.none('update users set firstname=$1, lastname=$2, email=$3 where user_id=$4', [req.body.firstname, req.body.lastname, req.body.email, userid])
        .then(function () {
          res.status(204).json({
            status: 'success',
            message: 'Updated user'
          });
        })
        .catch(function (err) {
          logger.logError('updateUser: ' + err);
          res.status(500).json(err);
        });
    });
}

function putUser(req, res, next) {
  var userid = getUserID(req);
  db.none('update users set firstname=$1, lastname=$2 where user_id=$3', [req.body.firstname, req.body.lastname, userid])
    .then(function () {
      res.status(200).json({
        message: 'User updated',
        type: 'success'
      });
    })
    .catch(function (err) {
      logger.logError('updateUser: ' + err);
      res.status(500).json(err);
    });
}

function removeUser(req, res, next) {
  var userid = getUserID(req);
  db.one('select user_id from users where user_id = $1', userid)
    .then(function (user) {

    });
}

function saltPassword(password) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
}

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({
      message: 'Please make sure your request has an Authorization header'
    });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, process.env.TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({
      message: err.message
    });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({
      message: 'Token has expired'
    });
  }
  req.user = payload.sub;
  next();
}


/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user.user_id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, process.env.TOKEN_SECRET);
}
