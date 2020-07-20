// getFiles api
const express = require('express')
const router = express.Router()

const info = require('../../private/javascripts/info')
const e = require('../../config/errors.json')

// get file info for user
router.get('/', function(req, res, next) {
  // make sure user is signed in
  if (!req.info.user) {
    res.send({success: false, error: "not logged in"})
    return
  }

  // read user's hmpgInfo
  info.read(req.info.userid, (readAttempt) => {
    if (!readAttempt.success) {
      res.send({success: false, error: readAttempt.error})
      return
    }

    res.send(readAttempt)
  })
})

// get file info for specific directory
router.post('/', function(req, res, next) {
  // verify post contents
  if (!req.body.userid || !req.body.link) {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // read target directory
  info.handleView(req.body.userid, req.body.link, (viewAttempt) => {
    if (!viewAttempt.success) {
      res.send({success: false, error: viewAttempt.error})
      return
    }

    res.send(viewAttempt)
  })
})

module.exports = router
