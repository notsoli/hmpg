// filesystem manipulation functions
const fs = require('fs')
const util = require('util')
const db = require('./db')
const info = require('./info')
const e = require('../../config/errors.json')

// allows fs functions to use promises
const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)
const access = util.promisify(fs.access)

// sets up an upload directory for user
async function createRoot(id, callback) {
  try {
    // concatenate full path
    const fullPath = "E:/hmpg/" + id

    // create directory and info file
    await mkdir(fullPath)
    const hmpgInfo = new info.Info()
    await writeFile("E:/hmpg/" + id + "/hmpgInfo.json", JSON.stringify(hmpgInfo))

    callback({success: true})
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// handle directory creation
function handleDirectory(id, directory, length, callback) {
  // replace backslashes with forwardslashes
  directory = directory.replace(/\\/g, "/")

  // determine if name is illegal
  const expression = new RegExp(/[?%*:|"<>]/)
  if (expression.test(directory)) {
    callback({success: false, error: e.fs.invalidName})
    return
  }

  // concatenate a path for the directory to go into
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // figure out directory name
  let name, directorySplit
  if (!directory.includes("/")) {
    name = directory
  } else {
    directorySplit = directory.split("/")
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
// this function is dummmmmbbbbb
async function createDirectory(path, callback) {
  try {
    // create directory
    await mkdir(path)

    console.log("successfully created directory " + path)
    callback({success: true})
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// handle file upload
function handleFile(file, id, length, callback) {
  // determine if name is illegal
  const expression = new RegExp(/[/\\?%*:|"<>]/)
  if (expression.test(file.name)) {
    callback({success: false, error: e.fs.invalidName})
    return
  }

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

// handles item move
function handleMove(id, link, path, callback) {
  info.searchItem(id, link, (searchAttempt) => {
    if (!searchAttempt.success) {
      callback({success: false, error: searchAttempt.error})
      return
    }

    const itemInfo = searchAttempt.itemInfo

    // concatenate base path from array
    let basePath
    if (itemInfo.path.length > 0) {
      basePath = itemInfo.path.join("/") + "/"
    } else {
      basePath = ""
    }

    // concatenate new path from array
    let newPath
    if (path === "") {
      newPath = path
    } else {
      newPath = path + "/"
    }

    // concatenate main path
    const mainPath = "E:/hmpg/" + id + "/"

    let name
    if (itemInfo.selectedItem.fileName) {
      name = itemInfo.selectedItem.fileName
    } else {
      name = itemInfo.selectedItem.dirName
    }

    // move file in filesystem
    fs.rename(mainPath + basePath + name, mainPath + newPath + name, (err) => {
      if (err) {
        callback({success: false, error: err})
        return
      }

      info.modifyItem(id, {action: "delete"}, link, (deleteAttempt) => {
        if (!deleteAttempt.success) {
          callback({success: false, error: deleteAttempt.error})
          return
        }

        // create item
        const item = itemInfo.selectedItem
        let newItem
        if (item.fileName) {
          newItem = new info.File(item.fileName, item.fileSize, item.fileType, item.fileLink)
        } else {
          newItem = new info.Directory(item.dirName, item.dirLink)
        }

        // add item to hmpgInfo
        info.addItem(id, path, newItem, (addAttempt) => {
          if (!addAttempt.success) {
            callback({success: false, error: addAttempt.error})
            return
          }

          // change link directory
          db.rename(id, link, newPath + name, (renameAttempt) => {
            if (!renameAttempt.success) {
              callback({success: false, error: renameAttempt.error})
              return
            }

            callback({success: true})
          })
        })
      })
    })
  })
}

// handles file deletion
function handleDelete(id, link, callback) {
  // search item in hmpgInfo.json
  info.searchItem(id, link, (searchAttempt) => {
    if (!searchAttempt.success) {
      callback({success: false, error: searchAttempt.error})
      return
    }

    const itemInfo = searchAttempt.itemInfo

    // concatenate path
    let basePath = itemInfo.path.join("/") + "/"
    if (itemInfo.selectedItem.fileName) {
      basePath += itemInfo.selectedItem.fileName
    } else {
      basePath += itemInfo.selectedItem.dirName
    }
    const fullPath = "E:/hmpg/" + id + "/" + basePath

    // check if item is a file or directory
    fs.stat(fullPath, (err, stats) => {
      if (err) {
        callback({success: false, error: err})
        return
      }

      // remove item from filesystem
      if (stats.isFile()) {
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.log(err)
            callback({success: false, error: err})
            return
          }

          completeDelete(id, link, (completeAttempt) => {
            if (!completeAttempt.success) {
              console.log(err)
              callback({success: false, error: completeAttempt.error})
              return
            }

            callback({success: true})
          })
        })
      } else {
        fs.rmdir(fullPath, (err) => {
          if (err) {
            console.log(err)
            callback({success: false, error: err})
            return
          }

          completeDelete(id, link, (completeAttempt) => {
            if (!completeAttempt.success) {
              console.log(err)
              callback({success: false, error: completeAttempt.error})
              return
            }

            callback({success: true})
          })
        })
      }
    })
  })
}

// remove item from link database and hmpgInfo.json
function completeDelete(id, link, callback) {
  // remove link from database
  db.unlink(id, link, (unlinkAttempt) => {
    if (!unlinkAttempt.success) {
      callback({success: false, error: unlinkAttempt.error})
      return
    }

    // delete item from hmpgInfo.json
    info.modifyItem(id, {action: "delete"}, link, (modifyAttempt) => {
      if (!modifyAttempt.success) {
        callback({success: false, error: modifyAttempt.error})
        return
      }

      callback({success: true})
    })
  })
}

// handles file renaming
function handleRename(id, link, name, callback) {
  // determine if name is illegal
  const expression = new RegExp(/[/\\?%*:|"<>]/)
  if (expression.test(name)) {
    callback({success: false, error: e.fs.invalidName})
    return
  }

  // rename item in hmpgInfo.json
  info.searchItem(id, link, (searchAttempt) => {
    if (!searchAttempt.success) {
      callback({success: false, error: searchAttempt.error})
      return
    }

    const itemInfo = searchAttempt.itemInfo

    // concatenate base path from array
    let basePath
    if (itemInfo.path.length > 0) {
      basePath = itemInfo.path.join("/") + "/"
    } else {
      basePath = ""
    }

    // concatenate full path
    const fullPath = "E:/hmpg/" + id + "/" + basePath
    let oldName
    if (itemInfo.selectedItem.fileName) {
      // verify filetype of new name
      const fileType = "." + itemInfo.selectedItem.fileType.split("/")[1]
      if (!name.endsWith(fileType)) {
        callback({success: false, error: e.fs.invalidName})
        return
      }

      oldName = itemInfo.selectedItem.fileName
    } else {
      oldName = itemInfo.selectedItem.dirName
    }

    // rename item in filesystem
    fs.rename(fullPath + oldName, fullPath + name, (err) => {
      if (err) {
        callback({success: false, error: err})
        return
      }

      // rename item in database
      db.rename(id, link, basePath + name, (renameAttempt) => {
        if (!renameAttempt.success) {
          callback({success: false, error: renameAttempt.error})
          return
        }

        info.modifyItem(id, {action: "rename", name: name}, link, (modifyAttempt) => {
          if (!modifyAttempt.success) {
            callback({success: false, error: modifyAttempt.error})
            return
          }

          callback({success: true})
        })
      })
    })
  })
}

module.exports.createRoot = createRoot
module.exports.handleDirectory = handleDirectory
module.exports.createDirectory = createDirectory
module.exports.handleFile = handleFile
module.exports.handleMove = handleMove
module.exports.handleDelete = handleDelete
module.exports.handleRename = handleRename
