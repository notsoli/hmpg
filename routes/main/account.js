// account router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')

// get & render page
router.all('/account', function(req, res, next) {
  req.info.title = "hmpg:account"
  res.render('./main/account', req.info)
})

module.exports = router
