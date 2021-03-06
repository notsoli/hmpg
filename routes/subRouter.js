// handles requests sent to subdomains
const express = require('express')
const router = express.Router()

const fs = require('fs')
const util = require('util')
const db = require('../private/javascripts/db')
const hash = require('../private/javascripts/hash')

// allows fs functions to use promises
const stat = util.promisify(fs.stat)

// render base homepage
const hmpgRouter = require('./sub/hmpgRouter')
router.all('/s/:target/', function(req, res, next) {
  // generate main payload
  hash.payload(req, res)

  // store target
  req.info.target = req.params.target
  next()
}, hmpgRouter)

// serve static files
router.all('/s/:target/:link', async function(req, res, next) {
  try {
    // store parameters
    const target = req.params.target
    const link = req.params.link

    // find directory of file
    const result = await db.findDirectory(target, link)
    const directory = "E:/hmpg/" + result.userid + "/" + result.directory

    const stats = await stat(directory)

    if (stats.isFile()) {
      console.log("serving file at directory " + directory)
      res.sendFile(directory)
    } else if (stats.isDirectory()) {
      console.log("serving directory " + directory)

      // generate main payload
      hash.payload(req, res)

      // set response cookies
      req.info.targetid = result.userid
      req.info.targetPath = result.directory.split("/")

      // set response title
      req.info.title = "hmpg:directory"

      // render page
      res.render('./sub/directory', req.info)
    }
  } catch (error) {
    console.log(error)
    next()
  }
})

module.exports = router
