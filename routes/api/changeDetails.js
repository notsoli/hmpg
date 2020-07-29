// deleteFiles api
const express = require('express')
const router = express.Router()

const db = require('../../private/javascripts/db')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', async function(req, res, next) {
  try {
    // make sure user is signed in
    if (!req.info.user) {
      throw new Error(e.request.noSession)
    }

    // verify post contents
    if (Object.keys(req.body).length !== 2) {
      throw new Error(e.request.badRequest)
    }

    await db.changeDetails(req.info.userid, req.body)

    res.send({success: true})
  } catch (error) {
    res.send({success: false, error: error.message})
  }
})

module.exports = router
