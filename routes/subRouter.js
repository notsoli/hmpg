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
  sql.findDirectory(target, link, (attempt) => {
    // check if directory was found
    if (!attempt.success) {
      console.log("failed to find file")
      return
    }

    const directory = "E:/hmpg/" + attempt.result.userid + "/" + attempt.result.directory
    console.log("serving file at directory " + directory)
    res.sendFile(directory)
  })
})

module.exports = router
