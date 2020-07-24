// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let main, fileInput, uploadButton, formStatus, fileList, linkInput

// cookie variables
let cookie

// create an array of requests
const requests = []

// create a file id
let fileId = 0

// keep track of orientation
let desktop

// init function
function init() {
  // populate cookie variables
  const cookies = document.cookie.split("; ")
  for (let i = 0; i < cookies.length; i++) {
    const currentCookie = cookies[i].split("=")
    if (currentCookie[0] === "settings") {
      settings = JSON.parse(decodeURIComponent(currentCookie[1]))
    }
  }

  // dom objects
  dropZone = document.querySelector("#dropZone")
  fileInput = document.querySelector("#fileInput")
  fileButton = document.querySelector("#fileButton")
  formStatus = document.querySelector("#formStatus")
  fileList = document.querySelector("#fileList")
  linkInput = document.querySelector("#linkInput")

  // set value of link input to default
  linkInput.value = settings.defaultFileLinkLength

  // populate desktop
  if (window.innerWidth >= 1224) {
    desktop = true
  } else {
    desktop = false
  }

  // drag and drop
  window.addEventListener("dragenter", () => {dropZone.style.display = "block"})
  dropZone.addEventListener('dragenter', allowDrag);
  dropZone.addEventListener('dragover', allowDrag);
  dropZone.addEventListener("dragleave", () => {dropZone.style.display = "none"})
  dropZone.addEventListener("drop", handleDrop)

  // manual file input
  fileInput.addEventListener("change", handleUpload)

  // format consistency
  window.addEventListener("resize", formatDesktop)
}

// allow file drops
function allowDrag(e) {
  // make sure the file being dragged is a valid one
  if (true) {
    e.dataTransfer.dropEffect = 'copy'
    e.preventDefault()
  }
}

// handle file drops
function handleDrop(e) {
  dropZone.style.display = "none"
  e.preventDefault()

  // process items
  if (e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        handleUpload(e, e.dataTransfer.items[i].getAsFile())
      }
    }
  } else {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      handleUpload(e, e.dataTransfer.files[i])
    }
  }
}

// send file to server
function handleUpload(e, dragFile) {
  // create file object
  let files

  // check if user dragged files
  if (!dragFile) {
    files = fileInput.files
  } else {
    files = [dragFile]
  }

  // make sure files are uploaded
  if (files.length === 0) {return}

  // creates a new AJAX request for each file
  for (let i = 0; i < files.length; i++) {
    // create a FormData object for ajax requests
    const fileForm = new FormData()

    // append file to form data
    fileForm.append("file", files[i])

    // verify link length
    if (linkInput.value > 16) {
      requestStatus.innerHTML = "link can't be longer than 16 characters"
      return
    }

    // append length to form data
    fileForm.append("length", linkInput.value)

    // create a new ajax request
    requests[fileId] = new XMLHttpRequest()

    // give the request an id
    requests[fileId].id = fileId

    // prepare to receive response
    requests[fileId].addEventListener("readystatechange", handleResponse)

    // send request
    requests[fileId].open("POST", "https://hmpg.io/upload")
    requests[fileId].send(fileForm)

    // add a new file entry to the list
    buildFile(files[i].name, files[i].size, fileId)

    // increment fileid
    fileId++
  }
}

// handle request response
function handleResponse(message) {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)

    // check if file upload was successful
    if (response.success == true) {
      // change file link
      const linkString = '<a href="' + response.link + '">' + response.link + '</a>'
      document.querySelector("#linkAttribute-" + this.id).innerHTML = linkString

      // change file status
      document.querySelector("#fileStatus-" + this.id).innerHTML = "done"
      console.log("uploaded file")

      // reset status
      requestStatus.innerHTML = ""
    } else {
      // set status as error message
      requestStatus.innerHTML = response.error
      document.querySelector("#file-" + this.id).remove()
    }
  }
}

// build file html
function buildFile(targetFileName, targetFileSize, id) {
  // create human-readable filesize, from Hristo on StackOverflow
  let tempSize = targetFileSize

  let i = -1
  const byteUnits = [' KB', ' MB', ' GB']

  // determine what suffix should be used
  do {
      tempSize = tempSize / 1024
      i++;
  } while (tempSize > 1024)

  const fileSize = Math.max(tempSize, 0.1).toFixed(1) + byteUnits[i]

  // build dom
  const domString = '<div class="file" id="file-' + id + '"><div class="fileIcon" id="fileIcon-' + id + '">▼</div><div class="fileName">' + targetFileName + '</div><div class="fileDropdown" id="fileDropdown-' + id + '"><div class="fileSize"><div class="attributeName">size:</div><div class="attributeValue">' + fileSize + '</div></div><div class="fileLink"><div class="attributeName">link:</div><div class="attributeValue" id="linkAttribute-' + id + '">...</div></div></div><div class="fileStatus" id="fileStatus-' + id + '">uploading</div></div>'
  const file = new DOMParser().parseFromString(domString, 'text/html')

  // append to fileList
  fileList.appendChild(file.body.firstChild)

  // add event listener
  document.querySelector("#fileIcon-" + id).addEventListener("click", toggleDropdown)
}

// toggle the information dropdown
function toggleDropdown() {
  // get file id
  const id = this.id.split("-")[1]

  // get file object
  const file = document.querySelector("#file-" + id)

  // determine if dropdown is toggled
  if (file.className.includes("toggled")) {
    // change visual atributes
    this.innerHTML = "▼"

    // hide dropdown
    document.querySelector("#fileDropdown-" + id).style.display = "none"

    // decrease file entry size
    file.style.height = "30px"

    // remove toggled class
    file.className = "file"
  } else {
    // change visual atributes
    this.innerHTML = "▲"

    // show dropdown
    document.querySelector("#fileDropdown-" + id).style.display = "flex"

    // increase file entry size
    file.style.height = "145px"

    // add toggled class
    file.className += " toggled"
  }
}

// format for desktop
function formatDesktop() {
  // check if width passes breakpoint
  if (window.innerWidth >= 1224 && !desktop) {
    for (let i = 0; i < requests.length; i++) {
      // imitate a toggle for each dropdown
      document.querySelector("#fileIcon-" + i).innerHTML = "▼"
      document.querySelector("#fileDropdown-" + i).style.display = "flex"
      document.querySelector("#file-" + i).style.height = "30px"
      document.querySelector("#file-" + i).className = "file"
    }
    desktop = true
  } else if (desktop) {
    for (let i = 0; i < requests.length; i++) {
      document.querySelector("#fileDropdown-" + i).style.display = "none"
    }
    desktop = false
  }
}
