// upload router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const hash = require('../../private/javascripts/hash')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// handle file uploads and other ajax requests
router.post('/upload', (req, res) => {
  // determine if upload is enabled
  if (!breaker.uploadEnabled) {
    res.send({success: false, error: e.breaker.uploadDisabled})
    return
  }

  // check if user is signed in
  if (!req.info.user) {
    res.send({success: false, error: e.request.noSession})
    return
  }

  // check if user has uploaded files
  if (!req.files) {
    res.send({success: false, error: e.upload.noFiles})
    return
  }

  // create file object
  const files = req.files.file

  // check if either one or multiple files are selected
  if (files.length) {
    // multiple files
    console.log("only one file per request")
    res.send({success: false, error: e.upload.multipleFiles})
    return
  }

  // single file
  file.handleFile(files, req.info.userid, 4, (handleAttempt) => {
    if (!handleAttempt.success) {
      console.log("failed to upload file")
      res.send({success: false, error: handleAttempt.error})
      return
    }

    // respond with the new link
    const completeLink = "http://" + req.info.user + ".hmpg.io/" + handleAttempt.link
    res.send({success: true, link: completeLink, uploads: req.info.uploads})
  })
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
