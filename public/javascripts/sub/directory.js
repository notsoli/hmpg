// waits until html data is loaded
window.addEventListener('load', init)

const simple = true

// init function
function init() {
  let targetid, targetPath
  const cookies = document.cookie.split("; ")
  for (let i = 0; i < cookies.length; i++) {
    const currentCookie = cookies[i].split("=")
    if (currentCookie[0] === "targetid") {
      targetid = currentCookie[1]
    } else if (currentCookie[0] === "targetPath") {
      targetPath = JSON.parse(decodeURIComponent(currentCookie[1]))
    }
  }

  // check if both components were found
  if (targetid && targetPath) {
    sendFileRequest(targetid, targetPath)
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
