// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let directoryInput, directoryButton

// init function
function init() {
  // dom objects
  directoryInput = document.querySelector("#directory")
  directoryButton = document.querySelector("#directoryButton")

  // event listeners
  directoryButton.addEventListener("click", sendDirectoryData)

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

function handleIconClick() {
  // create container reference
  const container = this.parentNode.parentNode.querySelector(".container")

  // toggle or un-toggle directory
  if (this.className.includes("toggled")) {
    // change icon
    this.innerHTML = "▼"

    // show container
    container.style.display = "block"

    // remove toggled class
    this.className = "hideIcon"
  } else {
    // change icon
    this.innerHTML = "▲"

    // hide container
    container.style.display = "none"

    this.className += " toggled"
  }
}

function handleItemSelect() {
  // gets the object's item id
  const id = this.parentNode.id.split("-")[1]
  document.querySelector("#currentItem").innerHTML = JSON.stringify(items[id])
}
