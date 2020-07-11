// create an array holding each file and directory
let items = [], itemId = 0

function sendFileRequest() {
  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleFileResponse)

  // send request
  request.open("GET", "http://hmpg.io/getFiles")
  request.send()
}

function handleFileResponse() {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)

    // check if login was successful
    if (response.success == true) {
      assembleFileList(JSON.parse(response.info))
    } else {
      // set status as error message
      return {success: false, error: response.error}
    }
  }
}

// assemble fileList dom using info
function assembleFileList(info) {
  // reset items and itemid
  items = [], itemId = 0

  // create fileList div
  const list = document.createElement("div")
  list.id = "fileList"

  // iterate through root
  for (let i = 0; i < info.root.length; i++) {
    const child = info.root[i]

    // check if child is a file or directory
    if (child.hasOwnProperty('fileName')) {
      list.appendChild(assembleFile(child))
    } else if (child.hasOwnProperty('dirName')) {
      list.appendChild(assembleDirectory(child))
    }
  }

  renderFileList(list)
}

// create file object
function assembleFile(file) {
  // add to items
  items[itemId] = file

  // create file element
  const fileElement = document.createElement("div")
  fileElement.className = "file"

  // create fileInfo element
  const domString = '<div class="fileInfo" id="item-' + itemId + '"><input type="checkbox" value="selected"><div class="fileType">i</div><div class="fileName">' + file.fileName + '</div></div>'
  const fileInfo = new DOMParser().parseFromString(domString, 'text/html')
  fileInfo.querySelector(".fileName").addEventListener("click", handleItemSelect)
  fileElement.appendChild(fileInfo.body.firstChild)

  // increment itemId
  itemId++

  return fileElement
}

// create directory object
function assembleDirectory(dir) {
  // add to items
  items[itemId] = dir

  // create directory wrapper
  const dirElement = document.createElement("div")
  dirElement.className = "directory"

  // create dirInfo element
  const domString = '<div class="dirInfo" id="item-' + itemId + '"><div class="hideIcon toggled">▲</div><input type="checkbox" value="selected"><div class="dirType">d</div><div class="dirName">' + dir.dirName + '</div></div>'
  const dirInfo = new DOMParser().parseFromString(domString, 'text/html')
  dirInfo.querySelector(".hideIcon").addEventListener("click", handleIconClick)
  dirInfo.querySelector(".dirName").addEventListener("click", handleItemSelect)
  dirElement.appendChild(dirInfo.body.firstChild)

  // create child container
  const containerElement = document.createElement("div")
  containerElement.className = "container"

  // increment itemId
  itemId++

  // iterate through children of directory
  for (let i = 0; i < dir.children.length; i++) {
    const child = dir.children[i]

    // check if child is a file or directory
    if (child.hasOwnProperty('fileName')) {
      // append file object
      containerElement.appendChild(assembleFile(child))
    } else if (child.hasOwnProperty('dirName')) {
      // recursively append directory object
      containerElement.appendChild(assembleDirectory(child))
    }
  }

  // append container
  dirElement.appendChild(containerElement)

  return dirElement
}
