// handles requests sent to subdomains
const express = require('express')
const router = express.Router()

const sql = require('../private/javascripts/db')
const hash = require('../private/javascripts/hash')
const fs = require('fs')

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

    fs.stat(directory, (err, stats) => {
      if (err) {
        return
      }

      if (stats.isFile()) {
        console.log("serving file at directory " + directory)
        res.sendFile(directory)
      } else if (stats.isDirectory()) {
        console.log("serving directory " + directory)

        // set login information
        req.info = hash.payload(req, res, next)

        // set response cookies
        res.cookie("targetid", attempt.result.userid, {maxAge: 900000, domain: 'hmpg.io'})
        res.cookie("targetLink", req.params.link, {maxAge: 900000, domain: 'hmpg.io'})

        // set response title
        req.info.title = "hmpg:directory"

        // render page
        res.render('./sub/directory', req.info)
      }
    })
  })
})

module.exports = router
