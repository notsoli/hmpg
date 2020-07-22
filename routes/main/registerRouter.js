// register router
const express = require('express')
const router = express.Router()

const db = require('../../private/javascripts/db')
const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// register a new user
router.post('/register', async (req, res, next) => {
  try {
    // determine if registration is enabled
    if (!breaker.registerEnabled) {
      throw new Error(e.breaker.registerDisabled)
    }

    // make sure body content is valid
    verifyBody(req.body)

    // assign form information to variables
    const {username, password, confirmpassword} = req.body

    // make sure username and password fit criteria for account creation
    db.validity(username, password, confirmpassword)

    // register user
    await db.register(username, password)
    console.log("successfully registered account '" + username + "'")

    const jwt = await completeRegister(username, password)
    console.log("successfully set up account'" + username + "'")

    // send jwt to user
    res.cookie('jwtToken', jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})
    res.send({success: true, login: true})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// sets the new user up following a successful register
async function completeRegister(username, password) {
  // get userid
  const userid = await db.userid(username)

  // create an upload directory
  file.createRoot(userid)

  // log the new user in
  const jwt = await db.login(username, password)
  console.log("successfully logged in to account '" + username + "'")
  resolve(jwt)
}

function verifyBody(body) {
  // verify post request length
  if (Object.keys(body).length !== 3) {
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

  // verify existence and type of confirmpassword
  if (!body.confirmpassword || typeof(body.confirmpassword) !== "string") {
    throw new Error(e.request.badRequest)
  }
}

// get & render page
router.all('/register', function(req, res, next) {
  req.info.title = "hmpg:register"
  res.render('./main/register', req.info)
})

module.exports = router
