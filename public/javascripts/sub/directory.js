// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let targetid, targetPath

const simple = true

// init function
function init() {
  const cookies = document.cookie.split("; ")
  targetid = cookies[0].split("=")[1]
  targetPath = JSON.parse(decodeURIComponent(cookies[1].split("=")[1]))
  sendFileRequest(targetid, targetPath)
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
