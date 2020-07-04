// filesystem manipulation functions

const db = require('./db')
const fs = require('fs')
const e = require('../../config/errors.json')

// handle file upload
function handle(file, id, length, callback) {
  // create a directory for the file to go into
  const directory = file.name
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // move file into desired directory
  move(file, completeDirectory, (moveAttempt) => {
    if (moveAttempt.success == true) {
      console.log("successfully moved file")

      // create a link for the file
      db.link(id, directory, length, (linkAttempt) => {
        if (linkAttempt.success == true) {
          console.log("successfully created link")
          callback(linkAttempt)
        } else {
          console.log(linkAttempt.error)
          callback(linkAttempt)
        }
      })
    } else {
      console.log(moveAttempt.error)
      callback(moveAttempt)
    }
  })
}

// move file into user filesystem
function move(file, directory, callback) {
  file.mv(directory, (err) => {
    if (err) {
      // failed moving file
      console.log(err)
      callback({success: false, error: e.link.failedMove})
    } else {
      // moved file
      callback({success: true})
    }
  })
}

module.exports.handle = handle
