// settings router
const express = require('express')
const router = express.Router()

const db = require('../../private/javascripts/db')

// get & render page
router.all('/settings', function(req, res, next) {
  // check if user is signed in
  if (req.info.user) {
    req.info.title = "hmpg:settings"
    res.render('./main/settings', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
