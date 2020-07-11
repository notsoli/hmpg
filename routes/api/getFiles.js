// getFiles api
const express = require('express')
const router = express.Router()

const info = require('../../private/javascripts/info')

// get file info for user
router.get('/', function(req, res, next) {
  // make sure user is signed in
  if (!req.info.user) {
    res.send({success: false, error: "not logged in"})
    return
  }

  info.read(req.info.userid, (readAttempt) => {
    if (!readAttempt.success) {
      res.send({success: false, error: readAttempt.error})
      return
    }

    res.send(readAttempt)
  })
})

module.exports = router
