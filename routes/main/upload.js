// upload router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')

// handle file uploads and other ajax requests
router.post('/upload', (req, res) => {
  if (req.files) {
    const files = req.files.file

    // check if either one or multiple files are selected
    if (files.length) {
      // multiple files
      for (let i = 0; i < files.length; i++) {
        file.download(files[i], req.info)
      }
    } else {
      // single file
      file.download(files, req.info)
    }
  }

  // check if user is signed in
  if (req.info.user) {
  }
})

// get & render page
router.all('/upload', function(req, res, next) {
  // check if user is signed in
  if (req.info.user) {
    req.info.title = "hmpg:upload"
    res.render('./main/upload', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
