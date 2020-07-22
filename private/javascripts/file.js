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
const rename = util.promisify(fs.rename)
const stat = util.promisify(fs.stat)
const unlink = util.promisify(fs.unlink)
const rmdir = util.promisify(fs.rmdir)

// sets up an upload directory for user
async function createRoot(id) {
  // concatenate full path
  const fullPath = "E:/hmpg/" + id

  // create directory and info file
  await mkdir(fullPath)
  const hmpgInfo = new info.Info()
  await writeFile("E:/hmpg/" + id + "/hmpgInfo.json", JSON.stringify(hmpgInfo))
}

// handle directory creation
async function handleDirectory(id, directory, length) {
  // replace backslashes with forwardslashes
  directory = directory.replace(/\\/g, "/")

  // determine if name is illegal
  const expression = new RegExp(/[?%*:|"<>]/)
  if (expression.test(directory)) {
    throw new Error(e.fs.invalidName)
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
  await mkdir(completeDirectory)

  // create a link for the directory
  const link = await db.link(id, directory, length)

  console.log("successfully created link")

  // add the directory to the user's hmpgInfo
  const newDirectory = new info.Directory(name, link)

  // remove last part of directory
  let baseDirectory
  if (!directory.includes("/")) {
    baseDirectory = ""
  } else {
    directorySplit.pop()
    baseDirectory = directorySplit.join("/")
  }

  // add item to hmpgInfo
  await info.addItem(id, baseDirectory, newDirectory)
  console.log("successfully added item")
  return link
}

// handle file upload
async function handleFile(file, id, length) {
  // determine if name is illegal
  const expression = new RegExp(/[/\\?%*:|"<>]/)
  if (expression.test(file.name)) {
    throw new Error(e.fs.invalidName)
  }

  // concatenate a path for the file to go into
  const directory = file.name
  const completeDirectory = "E:/hmpg/" + id + "/" + directory

  // move file into desired directory
  await move(file, completeDirectory)
  console.log("successfully moved file")

  // create a link for the file
  const link = await db.link(id, directory, length)
  console.log("successfully created link")

  // add the file to the user's hmpgInfo
  const newFile = new info.File(file.name, file.size, file.mimetype, link)

  await info.addItem(id, "", newFile)
  return link
}

// move file into user filesystem
function move(file, directory) {
  return new Promise(async (resolve, reject) => {
    file.mv(directory, (err) => {
      if (err) {reject(err)}
      resolve()
    })
  })
}

// handles item move
async function handleMove(id, link, path) {
  // search for item
  const search = await info.searchItem(id, link)
  const itemInfo = search.itemInfo

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
  await rename(mainPath + basePath + name, mainPath + newPath + name)

  await info.modifyItem(id, {action: "delete"}, link)

  // create item
  const item = itemInfo.selectedItem
  let newItem
  if (item.fileName) {
    newItem = new info.File(item.fileName, item.fileSize, item.fileType, item.fileLink)
  } else {
    newItem = new info.Directory(item.dirName, item.dirLink)
  }

  // add item to hmpgInfo
  await info.addItem(id, path, newItem)

  // change link directory
  await db.rename(id, link, newPath + name)
}

// handles item deletion
async function handleDelete(id, link) {
  // search item in hmpgInfo.json
  const search = await info.searchItem(id, link)
  const itemInfo = search.itemInfo

  // concatenate path
  let basePath = itemInfo.path.join("/") + "/"
  if (itemInfo.selectedItem.fileName) {
    basePath += itemInfo.selectedItem.fileName
  } else {
    basePath += itemInfo.selectedItem.dirName
  }
  const fullPath = "E:/hmpg/" + id + "/" + basePath

  // check if item is a file or directory
  const stats = await stat(fullPath)

  // remove item from filesystem
  if (stats.isFile()) {
    await unlink(fullPath)
  } else {
    await rmdir(fullPath)
  }

  // remove link from database
  await db.unlink(id, link)

  // delete item from hmpgInfo.json
  await info.modifyItem(id, {action: "delete"}, link)
}

// handles file renaming
async function handleRename(id, link, name) {
  // determine if name is illegal
  const expression = new RegExp(/[/\\?%*:|"<>]/)
  if (expression.test(name)) {throw new Error(e.fs.invalidName)}

  // rename item in hmpgInfo.json
  const search = await info.searchItem(id, link)
  const itemInfo = search.itemInfo

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
      throw new Error(e.fs.invalidName)
      return
    }

    oldName = itemInfo.selectedItem.fileName
  } else {
    oldName = itemInfo.selectedItem.dirName
  }

  // rename item in filesystem
  await rename(fullPath + oldName, fullPath + name)

  // rename item in database
  await db.rename(id, link, basePath + name)

  // rename item in hmpgInfo
  await info.modifyItem(id, {action: "rename", name: name}, link)
}

module.exports.createRoot = createRoot
module.exports.handleDirectory = handleDirectory
module.exports.handleFile = handleFile
module.exports.handleMove = handleMove
module.exports.handleDelete = handleDelete
module.exports.handleRename = handleRename
