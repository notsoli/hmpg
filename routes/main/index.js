// index router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')

// handle login requests
router.post('/', (req, res) => {
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
      } else {
        // username or password didn't match any database entries
        console.log("username or password is incorrect")
      }

      // redirect back to index
      res.redirect('/')
    })
  } else {
    // username or password isn't valid for login
    console.log("username or password is incorrect")

    // redirect back to index
    res.redirect('/')
  }
})

// get & render page
router.all('/', function(req, res, next) {
  req.info.title = "hmpg:home"
  res.render('./main/index', req.info)
})

module.exports = router
