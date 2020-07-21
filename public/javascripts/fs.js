// store each file and directory
let items = [], itemId = 0

// store currently selected items
let selected = []

// store currently focused item
let focused

function sendFileRequest(userid, link) {
  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleFileResponse)

  // send different request based on parameters
  if (userid !== undefined && link !== undefined) {
    // send request
    request.open("POST", "getFiles")
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    request.send(JSON.stringify({userid: userid, link: link}))
  } else {
    // send request
    request.open("GET", "getFiles")
    request.send()
  }
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

  if (!simple) {
    // activate/deactivate buttons
    if (selected.length > 0) {
      moveButton.className = "activeButton"
      deleteButton.className = "activeButton"
    } else {
      moveButton.className = "inactiveButton"
      deleteButton.className = "inactiveButton"
    }
  }
}

function handleItemSelect() {
  if (!simple) {
    // activate button
    renameButton.className = "activeButton"
  }

  // get the object's item id
  const id = this.parentNode.id.split("-")[1]
  const item = items[id]

  // set item as focused
  focused = item

  // get username
  const subdomain = window.location.host.split(".")[0]
  let username
  if (subdomain == "hmpg" || subdomain == "www") {
    // this is a stupid way to do it
    username = document.querySelector("#nav-profile").innerHTML
  } else {
    username = subdomain
  }

  // determine if item is a file or directory
  if (item.hasOwnProperty("fileName")) {
    // file name, size, and type
    document.querySelector("#itemName").innerHTML = "name: " + item.fileName
    document.querySelector("#itemSize").innerHTML = "size: " + item.displaySize
    document.querySelector("#itemType").innerHTML = "type: " + item.fileType

    // file link
    document.querySelector("#linkLabel").innerHTML = "link:"
    const completeLink = "https://" + username + ".hmpg.io/" + item.fileLink
    document.querySelector("#linkValue").innerHTML = item.fileLink
    document.querySelector("#linkValue").href = completeLink

    // file preview
    if (item.fileType.split("/")[0] === "image") {
      document.querySelector("#previewImage").src = completeLink
    } else {
      document.querySelector("#previewImage").src = "https://via.placeholder.com/150/"
    }
  } else {
    // directory name
    document.querySelector("#itemName").innerHTML = "name: " + item.dirName

    // directory size
    let suffix
    if (item.children.length === 1) {
      suffix = " item"
    } else {
      suffix = " items"
    }
    document.querySelector("#itemSize").innerHTML = "size: " + item.children.length + suffix

    // directory type
    document.querySelector("#itemType").innerHTML = "type: directory"

    // directory link
    document.querySelector("#linkLabel").innerHTML = "link:"
    const completeLink = "https://" + username + ".hmpg.io/" + item.dirLink
    document.querySelector("#linkValue").innerHTML = item.dirLink
    document.querySelector("#linkValue").href = completeLink

    // directory preview
    document.querySelector("#previewImage").src = "https://via.placeholder.com/150/"
  }
}
