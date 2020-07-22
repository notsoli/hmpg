// renameFiles api
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', async function(req, res, next) {
  try {
    // make sure user is signed in
    if (!req.info.user) {
      throw new Error(e.request.noSession)
    }

    // verify post contents
    if (typeof req.body !== "object" || !req.body.link || !req.body.name) {
      throw new Error(e.request.badRequest)
    }

    // rename file
    await file.handleRename(req.info.userid, req.body.link, req.body.name)
    res.send({success: true})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

module.exports = router
