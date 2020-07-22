// moveFiles api
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')

// get file info for user
router.post('/', function(req, res, next) {
  // make sure user is signed in
  if (!req.info.user) {
    res.send({success: false, error: e.request.noSession})
    return
  }

  // verify post contents
  if (!Array.isArray(req.body.links) || typeof req.body.path !== "string") {
    res.send({success: false, error: e.request.badRequest})
    return
  }

  moveItem(req.info.userid, req.body, 0, (completed, failed) => {
    res.send({success: true, completed: completed, failed: failed})
  })
})

async function moveItem(userid, body, id, callback, _completed, _failed) {
  // check if completed
  if (id == body.links.length) {
    callback(_completed, _failed)
    return
  }

  // populate completed and failed arrays
  let completed = [], failed = []
  if (_completed) {completed = _completed}
  if (_failed) {failed = _failed}

  try {
    await file.handleMove(userid, body.links[id], body.path)
    console.log("successfully moved item")
    completed.push({link: body.links[id]})
  } catch (error) {
    console.log(error)
    failed.push({link: body.links[id], error: error.message})
  }

  moveItem(userid, body, id + 1, callback, completed, failed)
}

module.exports = router
