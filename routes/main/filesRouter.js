// files router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// create a new directory
router.post('/files', (req, res) => {
  // check if file uploads are enabled
  if (!breaker.uploadEnabled) {
    res.send({success: false, error: e.breaker.registerDisabled})
    return
  }

  // check if user is signed in
  if (!req.info.user) {
    res.send({success: false, error: e.request.noSession})
    return
  }

  // make sure body content is valid
  const verifyResult = verifyBody(req.body)
  if (!verifyResult.success) {
    res.send({success: false, error: verifyResult.error})
    return
  }

  file.handleDirectory(req.info.userid, req.body.directory, 4, (handleAttempt) => {
    if (!handleAttempt.success) {
      console.log("failed to create directory")
      console.log(handleAttempt.error)
      res.send({success: false, error: e.upload.failedUpload})
      return
    }

    // respond with the new link
    res.send({success: true})
  })
})

function verifyBody(body) {
  // verify post request length
  if (Object.keys(body).length !== 1) {
    return {success: false, error: e.request.badRequest}
  }

  // verify existence and type of directory
  if (!body.directory || typeof(body.directory) !== "string") {
    return {success: false, error: e.request.badRequest}
  }

  return {success: true}
}

// get & render page
router.all('/files', function(req, res, next) {
  // check if user is signed in
  if (req.info.user) {
    req.info.title = "hmpg:files"
    res.render('./main/files', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
