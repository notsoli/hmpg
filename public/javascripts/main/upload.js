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

  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleResponse)

  // send request
  request.open("POST", "http://hmpg.io/upload")
  request.send(fileForm)
}

// handle request response
function handleResponse(message) {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)
    console.log(response)

    // check if file upload was successful
    if (response.success == true) {
      // redirect to files
      window.location.href = response.link
    } else {
      // set status as error message
      registerStatus.innerHTML = response.error
    }
  }
}
