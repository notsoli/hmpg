// getFiles api
const express = require('express')
const router = express.Router()

const info = require('../../private/javascripts/info')
const e = require('../../config/errors.json')

// get file info for user
router.get('/', async function(req, res, next) {
  try {
    // make sure user is signed in
    if (!req.info.login) {
      throw new Error("not logged in")
    }

    // read user's hmpgInfo
    const data = await info.read(req.info.login.userid)
    res.send({success: true, info: data})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// get file info for specific directory or directories
router.post('/', async function(req, res, next) {
  try {
    // verify post contents
    if (!req.body.userid || !req.body.paths) {
      throw new Error(e.request.badRequest)
    }

    const hmpgInfo = []

    // read target directory or directories
    for (let i = 0; i < req.body.paths.length; i++) {
      hmpgInfo[i] = await info.handleView(req.body.userid, req.body.paths[i])
    }

    res.send({success: true, info: JSON.stringify(hmpgInfo)})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

module.exports = router
