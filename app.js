// express server
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const subdomain = require('wildcard-subdomains')

const app = express()

// ******
// SETUP
// ******

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
// app.set('subdomain offset', 1)

// app setup
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// export app before it gets read by other pages
module.exports = app

// ******
// ROUTES
// ******

// configure wildcard subdomains
app.use(subdomain({
  namespace: 's',
  whitelist: ['']
}))

// route subdomain pages
const subRouter = require('./routes/subrouter')
app.all('/s/*', subRouter)

// route main domain pages
const mainRouter = require('./routes/mainrouter')
app.all('*', mainRouter)

// // list of available routes
//const routes = ['account', 'register', '']

// // route static pages, thank you kingsley solomon!
// for(let i = 0; i < routes.length; i++) {
//   app.use('/' + routes[i], (req, res, next) => {
//     console.log("matched regular domain")
//     // generate main payload
//     req.info = hash.payload(req, res, next)
//
//     // create account url
//     const user = req.info.user
//     if (user) {
//       req.info.accountUrl = user + '.' + req.get('Host')
//     }
//
//     // console.log(req.info)
//     next()
//   }, require('./routes/main/' + routes[i]))
// }

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
