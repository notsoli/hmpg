// filesystem manipulation functions
const fs = require('fs')
const util = require('util')
const db = require('./db')
const info = require('./info')
const e = require('../../config/errors.json')

// allows fs functions to use promises
const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)
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
async function handleDirectory(id, directory, length, display) {
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
  let name, directorySplit = []
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
  const newDirectory = new info.Directory(name, link, display)
  directorySplit.pop()

  // add item to hmpgInfo
  await info.modifyItem(id, {action: "add", item: newDirectory}, directorySplit)
  console.log("successfully created directory")
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

  await info.modifyItem(id, {action: "add", item: newFile}, [])
  return link
}

// move file into user filesystem
function move(file, directory) {
  return new Promise((resolve, reject) => {
    file.mv(directory, (err) => {
      if (err) {reject(err)}
      resolve()
    })
  })
}

// handles item move
async function handleMove(id, path, newPath) {
  // select item in hmpgInfo
  const item = await info.modifyItem(id, {action: "search"}, path)

  // determine name
  const name = path[path.length - 1]

  // remove last item from path
  path.pop()

  // concatenate base path from array
  let basePath
  if (path.length > 0) {
    basePath = path.join("/") + "/"
  } else {
    basePath = ""
  }

  // concatenate new path from array
  let splitPath = []
  if (newPath !== "") {
    splitPath = newPath.split("/")
    newPath += "/"
  }

  // concatenate main path
  const mainPath = "E:/hmpg/" + id + "/"

  // move file in filesystem
  await rename(mainPath + basePath + name, mainPath + newPath + name)

  // remove file from hmpgItem
  await info.modifyItem(id, {action: "delete", name: name}, path)

  // add item to hmpgInfo
  await info.modifyItem(id, {action: "add", item: item}, splitPath)

  // change link directory
  await db.rename(id, basePath + name, newPath + name)

  // iterate through and rename children
  if (item.type === "directory") {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await moveChild(id, basePath + name + "/" + child.name, newPath + name + "/" + child.name, child)
    }
  }
}

// handles file moving for children
async function moveChild(id, oldPath, newPath, item) {
  await db.rename(id, oldPath, newPath)

  // recursively moves the item's children
  if (item.type === "directory") {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await moveChild(id, oldPath + "/" + child.name, newPath + "/" + child.name, child)
    }
  }
}

// handles item deletion
async function handleDelete(id, path, item) {
  // search for item
  if (!item) {
    item = await info.modifyItem(id, {action: "search"}, path)
  }

  // if it has children, iterate through them
  if (item.children && item.children.length > 0) {
    for (let i = 0; i < item.children.length; i++) {
      // recursively delete the child element
      const child = item.children[i]
      const newPath = JSON.parse(JSON.stringify(path))
      newPath.push(child.name)
      await handleDelete(id, newPath, child)
    }
  }

  // concatenate path
  const fullPath = "E:/hmpg/" + id + "/" + path.join("/")

  // check if item is a file or directory
  const stats = await stat(fullPath)

  // remove item from filesystem
  if (stats.isFile()) {
    await unlink(fullPath)
  } else {
    await rmdir(fullPath)
  }

  // remove link from database
  await db.unlink(id, path.join("/"))

  // determine filename
  const name = path[path.length - 1]
  path.pop()

  // delete item from hmpgInfo.json
  await info.modifyItem(id, {action: "delete", name: name}, path)
}

// handles file renaming
async function handleRename(id, path, name) {
  // determine if name is illegal
  const expression = new RegExp(/[/\\?%*:|"<>]/)
  if (expression.test(name)) {throw new Error(e.fs.invalidName)}

  // search for item in hmpgInfo
  const item = await info.modifyItem(id, {action: "search"}, path)

  // verify filetype of new name
  if (item.type === "file") {
    const fileType = "." + item.filetype.split("/")[1]
    if (!name.endsWith(fileType)) {
      throw new Error(e.fs.invalidName)
    }
  }

  // concatenate filepaths
  const rootPath = "E:/hmpg/" + id + "/"

  let filePath = ""
  if (path.length > 1) {
    filePath = Array.from(path)
    filePath.pop()
    filePath = filePath.join("/") + "/"
  }

  const oldPath = filePath + path[path.length - 1]
  const newPath = filePath + name

  // rename item in filesystem
  await rename(rootPath + oldPath, rootPath + newPath)

  // rename item in database
  await db.rename(id, oldPath, newPath)

  // rename item in hmpgInfo
  await info.modifyItem(id, {action: "rename", name: name}, path)

  // iterate through and rename children
  if (item.type === "directory") {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await renameChild(id, oldPath + "/" + child.name, newPath + "/" + child.name, child)
    }
  }
}

// handles file renaming for children
async function renameChild(id, oldPath, newPath, item) {
  await db.rename(id, oldPath, newPath)

  // recursively renames the item's children
  if (item.type === "directory") {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await renameChild(id, oldPath + "/" + child.name, newPath + "/" + child.name, child)
    }
  }
}

module.exports.createRoot = createRoot
module.exports.handleDirectory = handleDirectory
module.exports.handleFile = handleFile
module.exports.handleMove = handleMove
module.exports.handleDelete = handleDelete
module.exports.handleRename = handleRename
