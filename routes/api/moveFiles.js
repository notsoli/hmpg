// moveFiles api
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', async function(req, res, next) {
  // make sure user is signed in
  if (!req.info.user) {
    res.send({success: false, error: e.request.noSession})
    return
  }

  // verify post contents
  if (!Array.isArray(req.body.paths) || typeof req.body.path !== "string") {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  // create completed and failed arrays
  let completed = [], failed = []

  // iterate through each move request
  for (let i = 0; i < req.body.paths.length; i++) {
    try {
      await file.handleMove(req.info.userid, req.body.paths[i], req.body.path)
      completed.push(req.body[i])
    } catch (error) {
      failed.push(req.body[i])
    }
  }

  res.send({success: true, completed: completed, failed: failed})
})

module.exports = router
