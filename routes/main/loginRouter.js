// login router
const express = require('express')
const router = express.Router()

const db = require('../../private/javascripts/db')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// handle login requests
router.post('/login', async (req, res) => {
  try {
    // determine if login is enabled
    if (!breaker.loginEnabled) {
      throw new Error(e.breaker.loginDisabled)
    }

    // make sure body content is valid
    verifyBody(req.body)

    // assign form information to variables
    const {username, password} = req.body

    // make sure username and password fit criteria for login
    db.validity(username, password, password)

    // attempt logging in
    const jwt = await db.login(username, password)
    console.log("successfully logged in to account '" + username + "'")

    // send jwt to user
    res.cookie('jwtToken', jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})
    res.send({success: true})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

function verifyBody(body) {
  // verify post request length
  if (Object.keys(body).length !== 2) {
    throw new Error(e.request.badRequest)
  }

  // verify existence and type of username
  if (!body.username || typeof(body.username) !== "string") {
    throw new Error(e.request.badRequest)
  }

  // verify existence and type of password
  if (!body.password || typeof(body.password) !== "string") {
    throw new Error(e.request.badRequest)
  }
}

// get & render page
router.all('/login', function(req, res, next) {
  req.info.title = "hmpg:login"
  res.render('./main/login', req.info)
})

module.exports = router
