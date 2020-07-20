// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let directoryInput, directoryButton

// init function
function init() {
  // dom objects
  directoryInput = document.querySelector("#directoryLabel")
  directoryButton = document.querySelector("#directoryButton")
  deleteButton = document.querySelector("#deleteButton")
  renameButton = document.querySelector("#renameButton")

  // event listeners
  directoryButton.addEventListener("click", sendDirectoryData)
  deleteButton.addEventListener("click", handleDelete)
  renameButton.addEventListener("click", handleRename)

  sendFileRequest()
}

// send form data to server
function sendDirectoryData() {
  // create a FormData object for ajax requests
  const directoryForm = new FormData()

  // append username and password to form data
  directoryForm.append('directory', directoryInput.value)

  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleResponse)

  // send request
  request.open("POST", "http://hmpg.io/files")
  request.send(directoryForm)
}

// handle request response
function handleResponse(message) {
  if (this.readyState == 4) {
    const response = JSON.parse(this.response)

    if (response.success === true) {
      sendFileRequest()
    } else {
      console.log(response.error)
    }
  }
}

// render file list dom created by fs.js
function renderFileList(list) {
  // remove current list if it exists
  const fileList = document.querySelector("#fileList")
  if (fileList) {
    fileList.remove()
  }

  // append new list
  document.querySelector("#fileWrapper").appendChild(list)
}

function handleItemSelect() {
  // get the object's item id
  const id = this.parentNode.id.split("-")[1]
  const item = items[id]

  // set item as focused
  focused = item

  // store username (this is a stupid way to do it)
  const username = document.querySelector("#nav-profile").innerHTML

  // determine if item is a file or directory
  if (item.hasOwnProperty("fileName")) {
    // file name, size, and type
    document.querySelector("#itemName").innerHTML = "name: " + item.fileName
    document.querySelector("#itemSize").innerHTML = "size: " + item.displaySize
    document.querySelector("#itemType").innerHTML = "type: " + item.fileType

    // file link
    document.querySelector("#linkLabel").innerHTML = "link:"
    const completeLink = "http://" + username + ".hmpg.io/" + item.fileLink
    document.querySelector("#linkValue").innerHTML = item.fileLink
    document.querySelector("#linkValue").href = completeLink
  } else {
    // directory name, size, and type
    document.querySelector("#itemName").innerHTML = "name: " + item.dirName
    document.querySelector("#itemSize").innerHTML = "size: " + item.children.length + " items"
    document.querySelector("#itemType").innerHTML = "type: directory"

    // directory link
    document.querySelector("#linkLabel").innerHTML = "link:"
    const completeLink = "http://" + username + ".hmpg.io/" + item.dirLink
    document.querySelector("#linkValue").innerHTML = item.dirLink
    document.querySelector("#linkValue").href = completeLink
  }
}

function handleDelete() {
  // determine if any files are selected
  if (selected.length > 0) {
    // store confirm result
    let result

    // send confirm message
    if (selected.length === 1) {
      result = confirm("Are you sure you want to delete 1 file?")
    } else {
      result = confirm("Are you sure you want to delete " + selected.length + " files?")
    }

    // check if user confirmed or not
    if (result === true) {
      sendDeleteRequest()
    }
  }
}

function sendDeleteRequest() {
  // create array of links used to identify items later
  const links = []
  for (let i = 0; i < selected.length; i++) {
    const item = items[selected[i]]

    if (item.hasOwnProperty("fileLink")) {
      links[i] = item.fileLink
    } else {
      links[i] = item.dirLink
    }
  }

  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleDeleteResponse)

  // send request
  request.open("POST", "http://hmpg.io/deleteFiles")
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  request.send(JSON.stringify(links))
}

function handleDeleteResponse() {
  if (this.readyState == 4) {
    sendFileRequest()
  }
}

function handleRename() {
  // determine if a file is selected
  if (focused) {
    // determine name and link
    let name, link
    if (focused.fileName) {
      name = focused.fileName
      link = focused.fileLink
    } else {
      name = focused.dirName
      link = focused.dirLink
    }

    // prompt user for new name
    const result = window.prompt("Please enter the new filename.", name)
    if (result) {
      if (focused.fileType) {
        // concatename and verify filetype
        const type = "." + focused.fileType.split("/")[1]
        if (!result.endsWith(type)) {
          alert("New name does not match filetype. Please try again.")
          handleRename()
          return
        }

        // send rename request
        sendRenameRequest(link, result)
      }
    }
  }
}

function sendRenameRequest(link, name) {
  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleRenameResponse)

  // send request
  request.open("POST", "http://hmpg.io/renameFiles")
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  request.send(JSON.stringify({link: link, name: name}))
}

function handleRenameResponse() {
  if (this.readyState == 4) {
    sendFileRequest()
  }
}
