// express server
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const subdomain = require('wildcard-subdomains')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const httpsRedirect = require('express-https-redirect')

const package = require('./package.json')
const hash = require('./private/javascripts/hash.js')

const app = express()

// ******
// SETUP
// ******

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// app setup
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : 'E:/hmpg/tmp'
}))
app.use(bodyParser.json())

// export app before it gets read by other pages
module.exports = app

// ******
// ROUTES
// ******

// configure https redirect
app.all('*', httpsRedirect())

// serve favicon
app.use(favicon('./public/images/favicon.ico'))

// route api pages, thank you kingsley solomon!
const routes = ['getFiles', 'deleteFiles', 'renameFiles']
for(let i = 0; i < routes.length; i++) {
  app.use('/' + routes[i], (req, res, next) => {
    // generate main payload
    req.info = hash.payload(req, res, next)

    next()
  }, require('./routes/api/' + routes[i]))
}

// configure wildcard subdomains
app.use(subdomain({
  namespace: 's',
  whitelist: ['www']
}))

// route subdomain pages
const subRouter = require('./routes/subRouter')
app.all('/s/*', subRouter)

// route main domain pages
const mainRouter = require('./routes/mainRouter')
app.all('*', mainRouter)

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

// confirmation
console.log("running " + package.name + " version " + package.version)
