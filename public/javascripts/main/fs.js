// store each file and directory
let items = [], itemId = 0

// store currently selected items
let selected = []

// store currently focused item
let focused

function sendFileRequest() {
  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleFileResponse)

  // send request
  request.open("GET", "https://hmpg.io/getFiles")
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
  // reset information-storing variables
  items = [], itemId = 0, selected = [], focused = undefined

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
  const domString = '<div class="fileInfo" id="item-' + itemId + '"><input class="checkbox" type="checkbox" value="selected"><div class="fileType">i</div><div class="fileName">' + file.fileName + '</div></div>'
  const fileInfo = new DOMParser().parseFromString(domString, 'text/html')
  fileInfo.querySelector(".checkbox").addEventListener("change", handleItemCheck)
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
  const domString = '<div class="dirInfo" id="item-' + itemId + '"><div class="hideIcon toggled">▲</div><input class="checkbox" type="checkbox" value="selected"><div class="dirType">d</div><div class="dirName">' + dir.dirName + '</div></div>'
  const dirInfo = new DOMParser().parseFromString(domString, 'text/html')
  dirInfo.querySelector(".hideIcon").addEventListener("click", handleIconClick)
  dirInfo.querySelector(".checkbox").addEventListener("change", handleItemCheck)
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

function handleItemCheck() {
  // get item id
  const id = this.parentNode.id.split("-")[1]

  // determine if checkbox is checked
  if (this.checked) {
    // push item to selected array
    selected.push(id)
  } else {
    // remove item from selected array
    for (let i = 0; i < selected.length; i++) {
      if (selected[i] === id) {
        selected.splice(i, 1)
      }
    }
  }
}
