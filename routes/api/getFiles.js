// getFiles api
const express = require('express')
const router = express.Router()

const info = require('../../private/javascripts/info')
const e = require('../../config/errors.json')

// get file info for user
router.get('/', async function(req, res, next) {
  try {
    // make sure user is signed in
    if (!req.info.user) {
      throw new Error("not logged in")
    }

    // read user's hmpgInfo
    const data = await info.read(req.info.userid)
    res.send({success: true, info: data})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// get file info for specific directory
router.post('/', async function(req, res, next) {
  try {
    // verify post contents
    if (!req.body.userid || !req.body.link) {
      throw new Error(e.request.badRequest)
    }

    // read target directory
    const hmpgInfo = await info.handleView(req.body.userid, req.body.link)
    res.send({success: true, info: hmpgInfo})
  } catch (error) {
    res.send({success: false, error: error.message})
  }
})

module.exports = router
