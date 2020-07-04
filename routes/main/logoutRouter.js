// logout router
const express = require('express')
const router = express.Router()

// get & render page
router.get('/logout', function(req, res, next) {
  // clear jwt cookie and redirect to index
  res.clearCookie("jwtToken", {domain: 'hmpg.io'})
  return res.status(200).redirect('/')
})

module.exports = router
