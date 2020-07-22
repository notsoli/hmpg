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
    if (!req.info.user) {
      throw new Error(e.request.noSession)
    }

    // check if user has uploaded files
    if (!req.files) {
      throw new Error(e.upload.noFiles)
    }

    // create file object
    const files = req.files.file

    // check if either multiple files are selected
    if (files.length) {
      throw new Error(e.upload.multipleFiles)
    }

    // single file
    const link = await file.handleFile(files, req.info.userid, 4)

    // respond with the new link
    const completeLink = "https://" + req.info.user + ".hmpg.io/" + link
    res.send({success: true, link: completeLink, uploads: req.info.uploads})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

// get & render page
router.all('/upload', function(req, res, next) {
  // check if user is signed in
  if (req.info.user) {
    // render page
    req.info.title = "hmpg:upload"
    res.render('./main/upload', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
