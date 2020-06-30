// account router
const express = require('express')
const router = express.Router()

const sql = require('../../private/javascripts/db')

// get & render page
router.all('/settings', function(req, res, next) {
  req.info.title = "hmpg:settings"
  res.render('./main/settings', req.info)
})

module.exports = router
