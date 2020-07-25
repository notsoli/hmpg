// hmpgInfo.json manipulation functions

const fs = require('fs')
const util = require('util')
const e = require('../../config/errors.json')

// allows fs functions to use promises
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

// file constructor function
function File(name, size, filetype, link) {
  this.type = "file"
  this.name = name
  this.size = size

  // calculate displaySize, from Hristo on StackOverflow
  let tempSize = this.size

  let i = -1
  const byteUnits = [' KB', ' MB', ' GB']

  // determine what suffix should be used
  do {
      tempSize = tempSize / 1024
      i++;
  } while (tempSize > 1024)

  this.displaySize = Math.max(tempSize, 0.1).toFixed(1) + byteUnits[i]

  this.filetype = filetype
  this.link = link
}

// directory constuctor function
function Directory(name, link) {
  this.type = "directory"
  this.display = "default"
  this.name = name
  this.link = link
  this.children = []
}

// info constructor function
function Info() {
  this.totalFiles = 0
  this.totalDirectories = 0
  this.totalSize = 0
  this.settings = {
    "defaultFileLinkLength": 4,
    "defaultDirectoryLinkLength": 8
  }
  this.children = []
}

// modifies a file from user's hmpgInfo.json
async function modifyItem(id, request, path) {
  // concatenate full hmpgInfo.json path
  const infoPath = "E:/hmpg/" + id + "/hmpgInfo.json"

  // read hmpgInfo.json
  const data = await readFile(infoPath)
  const hmpgInfo = JSON.parse(data)

  // search hmpgInfo for item
  let item = hmpgInfo
  let found = 0
  for (let i = 0; i < path.length; i++) {
    for (let c = 0; c < item.children.length; c++) {
      const child = item.children[c]
      if (child.name === path[i]) {
        item = child
        found = i
        break
      }
    }
  }

  // check if the item was found
  if (found !== path.length - 1 && path.length !== 0) {
    throw new Error("item not found")
  }

  if (request.action === "add") {
    // add item
    item.children.push(request.item)

    // modify hmpgInfo values
    if (request.item.type === "file") {
      hmpgInfo.totalFiles++
      hmpgInfo.totalSize += request.item.size
    } else {
      hmpgInfo.totalDirectories++
    }
  } else if (request.action === "delete") {
    // delete item
    let deletedItem
    for (let c = 0; c < item.children.length; c++) {
      if (item.children[c].name === request.name) {
        deletedItem = item.children[c]
        item.children.splice(c, 1)
        break
      }
    }

    // check if an item was deleted
    if (!deletedItem) {
      throw new Error("item to delete not found")
    }

    // modify hmpgInfo values
    if (deletedItem.type === "file") {
      hmpgInfo.totalFiles--
      hmpgInfo.totalSize -= deletedItem.size
    } else {
      hmpgInfo.totalDirectories--
    }
  } else if (request.action === "rename") {
    // rename item
    item.name = request.name
  }

  if (request.action !== "search") {
    // reassemble hmpgInfo.json
    const fileData = JSON.stringify(hmpgInfo)

    // write to hmpgInfo.json
    await writeFile(infoPath, fileData)
  }

  return item
}

// read user's hmpgInfo.json
async function read(id) {
  return await readFile("E:/hmpg/" + id + "/hmpgInfo.json", "utf8")
}

// send hmpgInfo with target directory's children as base
async function handleView(id, path) {
  const search = await modifyItem(id, {action: "search"}, path)

  // create dummy hmpgInfo object
  const hmpgInfo = JSON.parse(await read(id))
  hmpgInfo.children = search.children

  return JSON.stringify(hmpgInfo)
}

// change hmpgInfo settings
async function changeSettings(id, items) {
  // store completed and failed changes
  const completed = [], failed = []

  // read user's hmpgInfo settings
  const hmpgInfo = JSON.parse(await read(id))
  const settings = hmpgInfo.settings

  // iterate through each requested change
  const keys = Object.keys(items)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (settings[key] !== undefined) {
      settings[key] = items[key]
      completed.push(key)
    } else {
      failed.push(key)
    }
  }

  // write to hmpgInfo.json
  await writeFile("E:/hmpg/" + id + "/hmpgInfo.json", JSON.stringify(hmpgInfo))

  return {completed: completed, failed: failed, settings: settings}
}

async function readSetting(id, value) {
  const settings = JSON.parse(await read(id)).settings
  if (settings[value] !== undefined) {
    return settings[value]
  } else {
    throw new Error("failed to find setting")
  }
}

module.exports.File = File
module.exports.Directory = Directory
module.exports.Info = Info
module.exports.modifyItem = modifyItem
module.exports.read = read
module.exports.handleView = handleView
module.exports.changeSettings = changeSettings
module.exports.readSetting = readSetting
