// register router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')
const e = require('../../config/errors.json')

// register a new user
router.post('/register', (req, res, next) => {
  // create a request body reference
  const body = req.body

  // verify post request length
  if (Object.keys(body).length !== 3) {
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

  // verify existence and type of confirmpassword
  if (!body.confirmpassword || typeof(body.confirmpassword) !== "string") {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // assign form information to variables
  const {username, password, confirmpassword} = req.body

  // make sure username and password fit criteria for account creation
  const validity = sql.validity(username, password, confirmpassword)
  if (validity.result == true) {
    // register user
    sql.register(username, password, (success) => {
      // send confirmation and redirect back to homepage
      if (success == true) {
        console.log("successfully registered account '" + username + "'")

        // log the new user in
        sql.login(username, password, (attempt) => {
          // check if login was successful
          if (attempt.success) {
            // successful login
            console.log("successfully logged in to account '" + username + "'")

            // send jwt to user
            res.cookie('jwtToken', attempt.jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})
            res.send({success: true, login: true})
          } else {
            // registration was successful, but login wasn't
            console.log("failed to login")
            res.send({success: true, login: false})
          }
        })
      } else {
        // username is already taken
        console.log("failed to register account\nreason: username is already taken")
        res.send({success: false, error: e.validity.takenUsername})
      }
    })
  } else {
    // username or password is invalid for registration
    console.log("failed to register account\nreason: " + validity.reason)
    res.send({success: false, error: validity.reason})
  }
})

// get & render page
router.all('/register', function(req, res, next) {
  req.info.title = "hmpg:register"
  res.render('./main/register', req.info)
})

module.exports = router
