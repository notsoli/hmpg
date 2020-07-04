// upload router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const hash = require('../../private/javascripts/hash')

// handle file uploads and other ajax requests
router.post('/upload', (req, res) => {
  // check if user is signed in and has uploaded files
  if (req.info && req.files) {
    const files = req.files.file

    // check if either one or multiple files are selected
    if (files.length) {
      // multiple files
      console.log("only one file per request")
      res.send({success: false, error: "only one file per request"})
    } else {
      // single file
      file.handle(files, req.info.userid, 4, (handleAttempt) => {
        if (handleAttempt.success == true) {
          // respond with the new link
          const completeLink = "http://" + req.info.user + ".hmpg.io/" + handleAttempt.link
          res.send({success: true, link: completeLink, uploads: req.info.uploads})
        } else {
          console.log("failed to upload file")
        }
      })
    }
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
