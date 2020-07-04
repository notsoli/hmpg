// login router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')

// handle login requests
router.post('/login', (req, res) => {
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
        res.send({success: false, error: "username or password is incorrect"})
      }
    })
  } else {
    // username or password isn't valid for login
    console.log("username or password is incorrect")
    res.send({success: false, error: "username or password is incorrect"})
  }
})

// get & render page
router.all('/login', function(req, res, next) {
  req.info.title = "hmpg:login"
  res.render('./main/login', req.info)
})

module.exports = router
