// deleteFiles api
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', async function(req, res, next) {
  try {
    // make sure user is signed in
    if (!req.info.login) {
      throw new Error(e.request.noSession)
    }

    // verify post contents
    if (!Array.isArray(req.body)) {
      throw new Error(e.request.badRequest)
    }

    // create completed and failed arrays
    let completed = [], failed = []

    // iterate through each delete request
    for (let i = 0; i < req.body.length; i++) {
      try {
        await file.handleDelete(req.info.login.userid, req.body[i])
        completed.push(req.body[i])
      } catch (error) {
        console.log(error)
        failed.push(req.body[i])
      }
    }

    res.send({success: true, completed: completed, failed: failed})
  } catch (error) {
    res.send({success: false, error: error.message})
  }
})

module.exports = router
