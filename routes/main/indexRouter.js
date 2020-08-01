// index router
const express = require('express')
const router = express.Router()

// get & render page
router.all('/', function(req, res, next) {
  // check if user is logged in
  if (req.info.login) {
    return res.status(200).redirect('/files')
  }

  req.info.title = "hmpg:home"
  res.render('./main/index', req.info)
})

module.exports = router
