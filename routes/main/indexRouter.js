// index router
const express = require('express')
const router = express.Router()

// get & render page
router.all('/', function(req, res, next) {
  req.info.title = "hmpg:home"
  res.render('./main/index', req.info)
})

module.exports = router
