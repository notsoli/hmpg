// upload router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const hash = require('../../private/javascripts/hash')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// handle file uploads and other ajax requests
router.post('/upload', async (req, res) => {
  try {
    // determine if upload is enabled
    if (!breaker.uploadEnabled) {
      throw new Error(e.breaker.uploadDisabled)
    }

    // check if user is signed in
    if (!req.info.login) {
      throw new Error(e.request.noSession)
    }

    // check if user has uploaded files
    if (!req.files) {
      throw new Error(e.upload.noFiles)
    }

    // check if length is too long
    if (req.body.length > 16) {
      throw new Error("link can't be longer than 16 characters")
    }

    // create file object
    const files = req.files.file

    // check if either multiple files are selected
    if (files.length) {
      throw new Error(e.upload.multipleFiles)
    }

    // single file
    const item = await file.handleFile(files, req.info.login.userid, req.body.length)
    res.send({success: true, item: item})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// get & render page
router.all('/upload', function(req, res, next) {
  // check if user is signed in
  if (req.info.login) {
    // render page
    req.info.title = "hmpg:upload"
    res.render('./main/upload', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
