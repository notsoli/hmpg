// register router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')
const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// register a new user
router.post('/register', (req, res, next) => {
  // determine if registration is enabled
  if (!breaker.registerEnabled) {
    res.send({success: false, error: e.breaker.registerDisabled})
    return
  }

  // make sure body content is valid
  const verifyResult = verifyBody(req.body)
  if (!verifyResult.success) {
    res.send ({success: false, error: verifyResult.error})
    return
  }

  // assign form information to variables
  const {username, password, confirmpassword} = req.body

  // make sure username and password fit criteria for account creation
  const validity = sql.validity(username, password, confirmpassword)
  if (!validity.result) {
    console.log("failed to register account\nreason: " + validity.reason)
    res.send({success: false, error: validity.reason})
    return
  }

  // register user
  sql.register(username, password, (registerAttempt) => {
    // send confirmation and redirect back to homepage
    if (!registerAttempt.success) {
      console.log("failed to register account\nreason: " + registerAttempt.error)
      res.send({success: false, error: registerAttempt.error})
      return
    }

    console.log("successfully registered account '" + username + "'")
    completeRegister(username, password, (completeAttempt) => {
      if(!completeAttempt.success) {
        res.send({success: true, login: false})
        return
      }

      console.log("successfully set up account'" + username + "'")

      // send jwt to user
      res.cookie('jwtToken', completeAttempt.jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})
      res.send({success: true, login: true})
    })
  })
})

// sets the new user up following a successful register
function completeRegister(username, password, callback) {
  // get userid
  sql.userid(username, (idAttempt) => {
    // check if userid grab was successful
    if(!idAttempt.success) {
      callback({success: false, error: idAttempt.error})
      return
    }

    // create an upload directory
    file.createRoot(idAttempt.userid, (rootAttempt) => {
      if(!rootAttempt.success) {
        callback({success: false, error: rootAttempt.error})
        return
      }

      // log the new user in
      sql.login(username, password, (loginAttempt) => {
        // check if login was successful
        if (!loginAttempt.success) {
          console.log("failed to login")
          callback({success: false, error: loginAttempt.error})
          return
        }

        console.log("successfully logged in to account '" + username + "'")
        callback({success: true, jwt: loginAttempt.jwt})
      })
    })
  })
}

function verifyBody(body) {
  // verify post request length
  if (Object.keys(body).length !== 3) {
    return {success: false, error: e.request.badRequest}
  }

  // verify existence and type of username
  if (!body.username || typeof(body.username) !== "string") {
    return {success: false, error: e.request.badRequest}
  }

  // verify existence and type of password
  if (!body.password || typeof(body.password) !== "string") {
    return {success: false, error: e.request.badRequest}
  }

  // verify existence and type of confirmpassword
  if (!body.confirmpassword || typeof(body.confirmpassword) !== "string") {
    return {success: false, error: e.request.badRequest}
  }

  return {success: true}
}

// get & render page
router.all('/register', function(req, res, next) {
  req.info.title = "hmpg:register"
  res.render('./main/register', req.info)
})

module.exports = router
