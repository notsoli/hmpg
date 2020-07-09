// filesystem manipulation functions

const db = require('./db')
const fs = require('fs')
const e = require('../../config/errors.json')

// file constructor function
function File(path, name, size, type, link) {
  this.path = path
  this.name = name
  this.size = size
  this.displaySize = function() {
    // from Hristo on StackOverflow
    let tempSize = this.size

    let i = -1
    const byteUnits = [' KB', ' MB', ' GB']

    // determine what suffix should be used
    do {
        tempSize = tempSize / 1024
        i++;
    } while (fileSizeInBytes > 1024)

    return Math.max(tempSize, 0.1).toFixed(1) + byteUnits[i]
  }
  this.type = type
  this.link = link
}

// directory constuctor function
function Directory(path, name, link, children) {
  this.path = path
  this.name = name
  this.link = link
  this.children = children
}

// info constructor function
function Info(totalFiles, totalSize) {
  this.totalFiles = totalFiles
  this.totalSize = totalSize
}

// creates a directory if it doesn't already exist
function createDirectory(path, callback) {
  // concatenate full path
  const fullPath = "E:/hmpg" + path
  console.log(fullPath)

  fs.access(fullPath, fs.constants.F_OK, (accessError) => {
    // check if directory already exists
    if(!accessError || accessError.code !== "ENOENT") {
      callback({success: false, error: e.fs.directoryExists})
      return
    }

    // create directory
    fs.mkdir(fullPath, (mkdirError) => {
      // check if directory creation was unsuccessful
      if(mkdirError) {
        callback({success: false, error: e.fs.failedDirectory})
        return
      }

      console.log("created directory " + fullPath)
      callback({success: true})
    })
  })
}

// creates a file containing general attributes
function createInfo(id) {
  fs.writeFile("E:/hmpg/" + id + "/info.json", "{}", (err) => {
    if (err) {
      console.log("error creating info file")
      callback({success: false, error: e.fs.failedInfoWrite})
      return
    }

    console.log("created info file for user " + id)
    callback({success: true})
  })
}

// handle file upload
function handle(file, id, length, callback) {
  // create a directory for the file to go into
  const directory = file.name
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // move file into desired directory
  move(file, completeDirectory, (moveAttempt) => {
    if (moveAttempt.success == false) {
      console.log(moveAttempt.error)
      callback(moveAttempt)
      return
    }

    console.log("successfully moved file")

    // create a link for the file
    db.link(id, directory, length, (linkAttempt) => {
      if (linkAttempt.success == false) {
        console.log(linkAttempt.error)
        callback(linkAttempt)
        return
      }

      console.log("successfully created link")
      callback(linkAttempt)
    })
  })
}

// move file into user filesystem
function move(file, directory, callback) {
  file.mv(directory, (err) => {
    if (err) {
      console.log(err)
      callback({success: false, error: e.link.failedMove})
      return
    }

    callback({success: true})
  })
}

module.exports.createDirectory = createDirectory
module.exports.handle = handle
