// account router
const express = require('express')
const router = express.Router()

const db = require('../../private/javascripts/db')

// get & render page
router.all('/account', function(req, res, next) {
  // check if user is signed in
  if (req.info.login) {
    req.info.title = "hmpg:account"
    res.render('./main/account', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
