// hmpgInfo.json manipulation functions

const fs = require('fs')
const e = require('../../config/errors.json')

// file constructor function
function File(fileName, fileSize, fileType, fileLink) {
  this.fileName = fileName
  this.fileSize = fileSize

  // calculate displaySize, from Hristo on StackOverflow
  let tempSize = this.fileSize

  let i = -1
  const byteUnits = [' KB', ' MB', ' GB']

  // determine what suffix should be used
  do {
      tempSize = tempSize / 1024
      i++;
  } while (tempSize > 1024)

  this.displaySize = Math.max(tempSize, 0.1).toFixed(1) + byteUnits[i]

  this.fileType = fileType
  this.fileLink = fileLink
}

// directory constuctor function
function Directory(dirName, dirLink) {
  this.dirName = dirName
  this.dirLink = dirLink
  this.children = []
}

// info constructor function
function Info() {
  this.totalFiles = 0
  this.totalDirectories = 0
  this.totalSize = 0
  this.root = []
}

// adds a file to user's hmpgInfo.json
function addItem(id, path, item, callback) {
  // concatenate full hmpgInfo.json path
  const infoPath = "E:/hmpg/" + id + "/hmpgInfo.json"

  // read hmpgInfo.json
  fs.readFile(infoPath, (err, data) => {
    if (err) {
      console.log(err)
      callback({success: false, error: err})
      return
    }

    const hmpgInfo = JSON.parse(data)
    const root = hmpgInfo.root
    let newInfo

    // insert item into correct directory
    if (path === "") {
      // root directory
      newInfo = addRoot(hmpgInfo, item)
    } else if (!path.includes("/")) {
      // directory is 1 above root
      const attempt = addBase(hmpgInfo, path, item)
      if (!attempt.success) {
        callback({success: false, error: attempt.error})
        return
      }

      newInfo = attempt.newInfo
    } else {
      // directory is multiple above root
      const attempt = addBase(hmpgInfo, path, item)
      if (!attempt.success) {
        callback({success: false, error: attempt.error})
        return
      }

      newInfo = attempt.newInfo
    }

    if (item instanceof File) {
      newInfo.totalFiles++
      newInfo.totalSize += item.fileSize
    } else if (item instanceof Directory) {
      newInfo.totalDirectories++
    }

    // reassemble hmpgInfo.json
    const fileData = JSON.stringify(newInfo)

    // write to hmpgInfo.json
    fs.writeFile(infoPath, fileData, (err) => {
      if (err) {
        console.log(err)
        callback({success: false, error: err})
        return
      }

      callback({success: true})
    })
  })
}

// add item to root directory
function addRoot(info, item) {
  // create copy of hmpgInfo
  const newInfo = info

  // add new file to root
  newInfo.root.push(item)

  // return new hmpgInfo
  return newInfo
}

// add item to directory 1 under root
function addBase(info, path, item) {
  // create copy of hmpgInfo
  const newInfo = info
  const root = newInfo.root

  // add new file to directory
  let found = false
  for (let c = 0; c < root.length; c++) {
    const child = root.children[c]

    // push new item to identified directory
    if (child.dirName === path) {
      child.push(item)
      found = true
      break
    }
  }

  // directory wasn't found
  if (!found) {
    return {success: false, error: "directory wasn't found"}
  }

  // return new hmpgInfo
  return {success: true, newInfo: newInfo}
}

// add item to directory multiple under root
function addPath(info, path, item) {
  // create copy of hmpgInfo
  const newInfo = info
  const root = newInfo.root

  // add new file to directory
  const dir = path.split("/")
  let currentDir = root

  // iterate through each directory
  for (let d = 0; d < dir.length; d++) {
    let found = false

    // iterate through the directory's children
    for (let c = 0; c < currentDir.children.length; c++) {
      const child = currentDir.children[c]

      // set the current directory to the identified child
      if (child.dirName === dir[d]) {
        currentDir = child
        found = true
        break
      }
    }

    // directory wasn't found
    if (!found) {
      return {success: false, error: "directory wasn't found"}
    }
  }

  // push new item to the end directory
  child.push(item)

  // return new hmpgInfo
  return {success: true, newInfo: newInfo}
}

function read(id, callback) {
  fs.readFile("E:/hmpg/" + id + "/hmpgInfo.json", "utf8", (err, data) => {
    if (err) {
      console.log(err)
      callback({success: false, error: err})
      return
    }

    callback({success: true, info: data})
  })
}

module.exports.File = File
module.exports.Directory = Directory
module.exports.Info = Info
module.exports.addItem = addItem
module.exports.read = read
