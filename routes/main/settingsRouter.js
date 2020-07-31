// settings router
const express = require('express')
const router = express.Router()

const info = require('../../private/javascripts/info')
const hash = require('../../private/javascripts/hash')
const e = require('../../config/errors.json')

// handle setting change request
router.post('/settings', async (req, res) => {
  try {
    // make sure user is signed in
    if (!req.info.login) {
      throw new Error(e.request.noSession)
    }

    // make sure the post body isn't empty
    if (Object.keys(req.body) === 0) {
      throw new Error(e.request.badRequest)
    }

    // change settings in hmpgInfo
    const result = await info.changeSettings(req.info.login.userid, req.body)

    // create payload object
    const payload = {user: req.info.login.user, userid: req.info.login.userid, settings: result.settings}

    // create a jwt
    const jwt = hash.sign(payload)

    // send new jwt and settings to user
    res.cookie('jwtToken', jwt, {maxAge: 900000, httpOnly: true, domain: 'hmpg.io'})

    res.send({success: true, completed: result.completed, failed: result.failed})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// get & render page
router.all('/settings', function(req, res, next) {
  // check if user is signed in
  if (req.info.login) {
    req.info.title = "hmpg:settings"
    res.render('./main/settings', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
