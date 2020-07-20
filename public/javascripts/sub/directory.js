// waits until html data is loaded
window.addEventListener('load', init)

let targetid, targetLink

// init function
function init() {
  const cookies = document.cookie.split("; ")
  targetid = cookies[0].split("=")[1]
  targetLink = cookies[1].split("=")[1]
  sendFileRequest(targetid, targetLink)
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
