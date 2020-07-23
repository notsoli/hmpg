// deleteFiles api
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
  if (!Array.isArray(req.body)) {
    res.send({success: false, error: e.request.badRequest})
    return
  }
  console.log(req.body)

  deleteItem(req.info.userid, req.body, 0, (completed, failed) => {
    res.send({success: true, completed: completed, failed: failed})
  })
})

// delete items sequentially
async function deleteItem(userid, items, id, callback, _completed, _failed) {
  // check if completed
  if (id == items.length) {
    callback(_completed, _failed)
    return
  }

  // populate completed and failed arrays
  let completed = [], failed = []
  if (_completed) {completed = _completed}
  if (_failed) {failed = _failed}

  try {
    await file.handleDelete(userid, items[id])
    console.log("successfully deleted item")
    completed.push({link: items[id]})
  } catch (error) {
    console.log(error)
    failed.push({link: items[id], error: error.message})
  }

  deleteItem(userid, items, id + 1, callback, completed, failed)
}

module.exports = router
