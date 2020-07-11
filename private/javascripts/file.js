// filesystem manipulation functions

const db = require('./db')
const info = require('./info')
const fs = require('fs')
const e = require('../../config/errors.json')

// sets up an upload directory for user
function createRoot(id, callback) {
  // concatenate full path
  const fullPath = "E:/hmpg/" + id

  // create directory
  fs.mkdir(fullPath, (mkdirError) => {
    // check if directory creation was unsuccessful
    if (mkdirError) {
      callback({success: false, error: e.fs.failedDirectory})
      return
    }

    // create base json
    const hmpgInfo = new info.Info()

    // create info file
    fs.writeFile("E:/hmpg/" + id + "/hmpgInfo.json", JSON.stringify(hmpgInfo), (err) => {
      if (err) {
        console.log("error creating info file")
        callback({success: false, error: e.fs.failedInfoWrite})
        return
      }

      callback({success: true})
    })
  })
}

// handle directory creation
function handleDirectory(id, directory, length, callback) {
  // concatenate a path for the directory to go into
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // figure out directory name
  let name, directorySplit
  if (!directory.includes("/")) {
    name = directory
  } else {
    const directorySplit = directory.split("/")
    name = directorySplit[directorySplit.length - 1]
  }

  // create a directory in user's filesystem
  createDirectory(completeDirectory, (createAttempt) => {
    if (!createAttempt.success) {
      callback({success: false, error: createAttempt.error})
      return
    }

    // create a link for the directory
    db.link(id, directory, length, (linkAttempt) => {
      if (!linkAttempt.success) {
        callback({success: false, error: linkAttempt.error})
        return
      }

      console.log("successfully created link")

      // add the directory to the user's hmpgInfo
      const newDirectory = new info.Directory(name, linkAttempt.link)

      // remove last part of directory
      let baseDirectory
      if (!directory.includes("/")) {
        baseDirectory = ""
      } else {
        directorySplit.pop()
        baseDirectory = directorySplit.join("/")
      }

      info.addItem(id, baseDirectory, newDirectory, (addAttempt) => {
        if (!addAttempt.success) {
          callback({success: false, error: addAttempt.error})
          return
        }

        console.log("successfully added item")

        callback(linkAttempt)
      })
    })
  })
}

// creates a directory if it doesn't already exist
function createDirectory(path, callback) {
  fs.access(path, fs.constants.F_OK, (accessError) => {
    // check if directory already exists
    if (!accessError || accessError.code !== "ENOENT") {
      callback({success: false, error: e.fs.directoryExists})
      return
    }

    // create directory
    fs.mkdir(path, (mkdirError) => {
      // check if directory creation was unsuccessful
      if (mkdirError) {
        callback({success: false, error: e.fs.failedDirectory})
        return
      }

      console.log("successfully created directory " + path)
      callback({success: true})
    })
  })
}

// handle file upload
function handleFile(file, id, length, callback) {
  // concatenate a path for the file to go into
  const directory = file.name
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // move file into desired directory
  move(file, completeDirectory, (moveAttempt) => {
    if (!moveAttempt.success) {
      callback({success: false, error: moveAttempt.error})
      return
    }

    console.log("successfully moved file")

    // create a link for the file
    db.link(id, directory, length, (linkAttempt) => {
      if (!linkAttempt.success) {
        callback({success: false, error: linkAttempt.error})
        return
      }

      console.log("successfully created link")

      // add the file to the user's hmpgInfo
      const newFile = new info.File(file.name, file.size, file.mimetype, linkAttempt.link)

      info.addItem(id, "", newFile, (addAttempt) => {
        if (!addAttempt.success) {
          callback({success: false, error: addAttempt.error})
          return
        }

        console.log("successfully added item")

        callback(linkAttempt)
      })
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

// const testFile = new File("test.png", 10000, "image/png", "xZ3Z")
// addItem(3, "", testFile, (attempt) => {
//   console.log(attempt)
// })

module.exports.createRoot = createRoot
module.exports.handleDirectory = handleDirectory
module.exports.createDirectory = createDirectory
module.exports.handleFile = handleFile
