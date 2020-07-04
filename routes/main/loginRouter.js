// login router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// handle login requests
router.post('/login', (req, res) => {
  // determine if login is enabled
  if (!breaker.loginEnabled) {
    res.send({success: false, error: e.breaker.loginDisabled})
    return
  }

  // create a request body reference
  const body = req.body

  // verify post request length
  if (Object.keys(body).length !== 2) {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // verify existence and type of username
  if (!body.username || typeof(body.username) !== "string") {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // verify existence and type of password
  if (!body.password || typeof(body.password) !== "string") {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // assign form information to variables
  const {username, password} = req.body

  // make sure username and password fit criteria for login
  const validity = sql.validity(username, password, password)
  if (validity.result == true) {
    // attempt logging in
    sql.login(username, password, (attempt) => {
      if (attempt.success == true) {
        // successful login
        console.log("successfully logged in to account '" + username + "'")

        // send jwt to user
        res.cookie('jwtToken', attempt.jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})
        res.send({success: true})
      } else {
        // username or password didn't match any database entries
        console.log("username or password is incorrect")
        res.send({success: false, error: e.validity.invalidLogin})
      }
    })
  } else {
    // username or password isn't valid for login
    console.log("username or password is incorrect")
    res.send({success: false, error: e.validity.invalidLogin})
  }
})

// get & render page
router.all('/login', function(req, res, next) {
  req.info.title = "hmpg:login"
  res.render('./main/login', req.info)
})

module.exports = router
