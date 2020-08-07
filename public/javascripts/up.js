// handle file uploads
const up = (() => {
  // store dom objects
  let d

  // store upload requests
  const requests = []

  // store upload id
  let fileId = 0

  // stores nav
  let nav

  // prepare for file upload
  function init(domObjects, editNav) {
    // assign dom objects
    d = domObjects

    // assign nav
    nav = editNav

    // drag and drop
    window.addEventListener("dragenter", () => {d.dropZone.style.display = "block"})
    d.dropZone.addEventListener('dragenter', allowDrag);
    d.dropZone.addEventListener('dragover', allowDrag);
    d.dropZone.addEventListener("dragleave", () => {d.dropZone.style.display = "none"})
    d.dropZone.addEventListener("drop", handleDrop)

    // manual file input
    d.fileInput = document.querySelector("#fileInput")
    d.fileInput.addEventListener("change", handleUpload)
  }

  // allow file drops
  function allowDrag(e) {
    e.dataTransfer.dropEffect = 'copy'
    e.preventDefault()

    // show upload interface
    if (d.uploadInterface.style.display === "none") {
      d.interfaces.style.display = "block"
      d.uploadInterface.style.display = "block"
    }
  }

  // handle file drops
  function handleDrop(e) {
    d.dropZone.style.display = "none"
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
      files = d.fileInput.files
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
      // if (linkInput.value > 16) {
      //   requestStatus.innerHTML = "link can't be longer than 16 characters"
      //   return
      // }

      // append length to form data
      fileForm.append("length", 4)

      // create a new ajax request
      requests[fileId] = new XMLHttpRequest()

      // give the request an id
      requests[fileId].upload.id = fileId

      // update progress
      requests[fileId].upload.addEventListener("progress", (e) => {
        const currentUpload = document.querySelector("#upload-" + e.target.id)
        const percentComplete = (Math.ceil(e.loaded / e.total) * 100) + "%"
        currentUpload.querySelector(".uploadProgress").style.width = percentComplete
        currentUpload.querySelector(".uploadPercent").innerHTML = percentComplete
      })

      // prepare to receive response
      requests[fileId].addEventListener("readystatechange", handleResponse)

      // send request
      requests[fileId].open("POST", "https://hmpg.io/upload")
      requests[fileId].send(fileForm)

      // add a new file entry to the list
      buildFile(files[i].name, fileId)

      // increment fileid
      fileId++
    }
  }

  // handle request response
  function handleResponse() {
    if (this.readyState == 4) {
      // store request response
      const response = JSON.parse(this.response)

      // check if file upload was successful
      if (response.success == true) {
        if (nav) {
          // push new item to view
          response.item.path = []
          nav.items.push(response.item)
          const newItem = nav.assembleFile(response.item)
          document.querySelector("#content").appendChild(newItem)
        }
      } else {

      }
    }
  }

  // build file html
  function buildFile(targetFileName, id) {
    // // create human-readable filesize, from Hristo on StackOverflow
    // let tempSize = targetFileSize
    //
    // let i = -1
    // const byteUnits = [' KB', ' MB', ' GB']
    //
    // // determine what suffix should be used
    // do {
    //     tempSize = tempSize / 1024
    //     i++;
    // } while (tempSize > 1024)
    //
    // const fileSize = Math.max(tempSize, 0.1).toFixed(1) + byteUnits[i]

    // build dom
    const domString = '<div class="uploadFile" id="upload-' + id + '"><div class="uploadProgress"></div><img class="uploadIcon" src="images/icons/file-default.png"/><div class="uploadName">' + targetFileName + '</div><div class="uploadPercent">0%</div></div>'
    const file = new DOMParser().parseFromString(domString, 'text/html')

    // add event listener

    // append to fileList
    d.uploadTarget.appendChild(file.body.firstChild)
  }

  // return values and functions so other files can use them
  return {
    init: init
  }
})()
