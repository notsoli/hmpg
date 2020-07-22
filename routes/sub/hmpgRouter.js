const express = require('express')
const router = express.Router()

// const db = require('../private/javascripts/db')
// const hash = require('../private/javascripts/hash')

// get & render page
router.all('*', function(req, res, next) {
  const target = req.subdomains[0]
  req.info.target = target
  req.info.title = "hmpg:" + target
  res.render('./sub/hmpg', req.info)
})

module.exports = router
