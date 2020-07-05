// handles requests sent to subdomains
const express = require('express')
const router = express.Router()

const sql = require('../private/javascripts/db')
const hash = require('../private/javascripts/hash')

// render base homepage
const hmpgRouter = require('./sub/hmpgRouter')
router.all('/s/:target/', function(req, res, next) {
  req.info = hash.payload(req, res, next)

  // create account url
  const user = req.info.user

  // store target
  req.info.target = req.params.target

  // console.log(req.info)
  next()
}, hmpgRouter)

// serve static files
router.all('/s/:target/:link', function(req, res, next) {
  // store parameters
  const target = req.params.target
  const link = req.params.link

  // find directory of file
  const directory = sql.findDirectory(target, link, (result) => {
    // check if directory was found
    if (result) {
      const directory = "E:/hmpg/" + result.userid + "/" + result.directory
      console.log("serving file at directory " + directory)
      res.sendFile(directory)
    } else {
      console.log("failed to find file")
      next()
    }
  })
})

module.exports = router
