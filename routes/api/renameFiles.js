// renameFiles api
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', function(req, res, next) {
  // make sure user is signed in
  if (!req.info.user) {
    res.send({success: false, error: e.request.noSession})
    return
  }

  // verify post contents
  if (typeof req.body !== "object" || !req.body.link || !req.body.name) {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // rename file
  file.handleRename(req.info.userid, req.body.link, req.body.name, (renameAttempt) => {
    if (!renameAttempt.success) {
      console.log(renameAttempt.error)
      res.send({success: false, error: renameAttempt.error})
      return
    }

    res.send({success: true})
  })
})

module.exports = router
