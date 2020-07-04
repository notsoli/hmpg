// files router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')

// get & render page
router.all('/files', function(req, res, next) {
  // check if user is signed in
  if (req.info.user) {
    req.info.title = "hmpg:files"
    res.render('./main/files', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
