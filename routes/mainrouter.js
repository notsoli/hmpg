// handles requests sent to the main domain
const express = require('express')
const router = express.Router()

// const sql = require('../private/javascripts/db')
const hash = require('../private/javascripts/hash')

// list of available routes
const routes = ['login', 'register', 'upload', 'files', 'account', 'settings', 'logout', '']

// route static pages, thank you kingsley solomon!
for(let i = 0; i < routes.length; i++) {
  router.all('/' + routes[i], (req, res, next) => {
    // generate main payload
    req.info = hash.payload(req, res, next)

    // create account url
    const user = req.info.user

    // console.log(req.info)
    next()
  }, require('./main/' + routes[i]))
}

module.exports = router
