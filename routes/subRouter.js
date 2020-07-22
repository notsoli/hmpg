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
  req.info = hash.payload(req, res, next)

  // create account url
  const user = req.info.user

  // store target
  req.info.target = req.params.target

  // console.log(req.info)
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

      // set login information
      req.info = hash.payload(req, res, next)

      // set response cookies
      res.cookie("targetid", result.userid, {maxAge: 900000, domain: 'hmpg.io'})
      res.cookie("targetLink", req.params.link, {maxAge: 900000, domain: 'hmpg.io'})

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
