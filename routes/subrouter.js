// handles requests sent to subdomains
const express = require('express')
const router = express.Router()

// const sql = require('../private/javascripts/db')
const hash = require('../private/javascripts/hash')

// get & render page
const hmpg = require('./sub/hmpg')
router.all('/s/:target/', function(req, res, next) {
  req.info = hash.payload(req, res, next)

  // create account url
  const user = req.info.user
  if (user) {
    req.info.accountUrl = 'http://' + user + '.hmpg.io'
  }

  // store target
  req.info.target = req.params.target

  // console.log(req.info)
  next()
}, hmpg)

module.exports = router
