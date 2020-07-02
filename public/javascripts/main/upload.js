// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let fileInput, uploadButton, formStatus

// init function
function init() {
  // dom objects
  fileInput = document.getElementById("fileInput")
  uploadButton = document.getElementById("uploadButton")
  formStatus = document.getElementById("formStatus")

  // event listeners
  uploadButton.addEventListener("click", sendFileData)
}

// send file to server
function sendFileData() {
  // create a FormData object for ajax requests
  const fileForm = new FormData()

  // get a list of all files selected
  const files = fileInput.files

  // check if any files were selected and if so, adds each to the form data
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      fileForm.append("file", files[i])
    }
  }

  const request = new XMLHttpRequest()
  request.open("POST", "http://hmpg.io/upload")

  // monitor request progress
  request.addEventListener('progress', (event) => {
    monitorProgress(event)
  })

  request.send(fileForm)
}

function monitorProgress(event) {
  console.log(event.loaded)
  console.log(event.total)
}

// update form status
function updateStatus(message) {
  formStatus.innerHTML = message
}
