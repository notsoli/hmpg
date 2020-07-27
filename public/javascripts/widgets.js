// provides utilities for rendering specific widgets
// basic filesystem explorer
const nav = (() => {
  // store each file and directory
  let items = [], itemId = 0

  // store currently selected items
  let selected = []

  // store currently focused item
  let focused

  // dom objects
  let dom

  // assemble fileList dom using info
  function assembleFileList(info, domObjects, simple) {
    // reset information-storing variables
    nav.items = [], nav.itemId = 0, nav.selected = [], nav.focused = undefined

    // create fileList div
    const list = document.createElement("div")
    list.id = "fileList"

    // iterate through base
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]
      // check if child is a file or directory
      if (child.type === "file") {
        list.appendChild(assembleFile(child))
      } else if (child.type === "directory") {
        list.appendChild(assembleDirectory(child, [child.name]))
      }
    }

    init(list, domObjects, simple)
  }

  // create file object
  function assembleFile(file) {
    // add to items
    nav.items[itemId] = file

    // create file element
    const fileElement = document.createElement("div")
    fileElement.className = "file"

    // create fileInfo element
    const domString = '<div class="fileInfo" id="item-' + itemId + '"><input class="checkbox" type="checkbox" value="selected"><div class="fileType">i</div><div class="fileName">' + file.name + '</div></div>'
    const fileInfo = new DOMParser().parseFromString(domString, 'text/html')
    fileElement.appendChild(fileInfo.body.firstChild)

    // increment itemId
    itemId++

    // return completed element
    return fileElement
  }

  // create directory object
  function assembleDirectory(dir) {
    // add to items
    nav.items[itemId] = dir

    // create directory wrapper
    const dirElement = document.createElement("div")
    dirElement.className = "directory"

    // create dirInfo element
    const domString = '<div class="dirInfo" id="item-' + itemId + '"><div class="hideIcon toggled">▲</div><input class="checkbox" type="checkbox" value="selected"><div class="dirType">d</div><div class="dirName">' + dir.name + '</div></div>'
    const dirInfo = new DOMParser().parseFromString(domString, 'text/html')
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
      if (child.type === "file") {
        // append file object
        containerElement.appendChild(assembleFile(child))
      } else if (child.type === "directory") {
        // recursively append directory object
        containerElement.appendChild(assembleDirectory(child))
      }
    }

    // append container
    dirElement.appendChild(containerElement)

    // return completed element
    return dirElement
  }

  // add event listeners for objects
  function init(element, domObjects, simple) {
    // checkboxes
    if (!simple) {
      const checkboxes = element.getElementsByClassName('checkbox')
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', handleItemCheck)
      }
    }

    // file names
    const fileNames = element.getElementsByClassName('fileName')
    for (let i = 0; i < fileNames.length; i++) {
      fileNames[i].addEventListener('click', (req) => {handleItemSelect(req.target, simple)})
    }

    // directory names
    const dirNames = element.getElementsByClassName('dirName')
    for (let i = 0; i < dirNames.length; i++) {
      dirNames[i].addEventListener('click', (req) => {handleItemSelect(req.target, simple)})
    }

    // display/collapse icons
    const hideIcons = element.getElementsByClassName('hideIcon')
    for (let i = 0; i < hideIcons.length; i++) {
      hideIcons[i].addEventListener('click', handleIconClick)
    }

    // assign dom objects
    dom = domObjects

    dom.target.appendChild(element)
  }

  // handle checkbox clicks
  function handleItemCheck() {
    // get item id
    const id = this.parentNode.id.split("-")[1]

    // determine if checkbox is checked
    if (this.checked) {
      // push item to selected array
      nav.selected.push(id)
    } else {
      // remove item from selected array
      for (let i = 0; i < nav.selected.length; i++) {
        if (nav.selected[i] === id) {
          nav.selected.splice(i, 1)
        }
      }
    }

    // activate/deactivate buttons
    if (nav.selected.length > 0) {
      dom.moveButton.className = "activeButton"
      dom.deleteButton.className = "activeButton"
    } else {
      dom.moveButton.className = "inactiveButton"
      dom.deleteButton.className = "inactiveButton"
    }
  }

  // handle item selection
  function handleItemSelect(target, simple) {
    if (!simple) {
      // activate button
      dom.renameButton.className = "activeButton"
    }

    // get the object's item id
    const id = target.parentNode.id.split("-")[1]
    const item = nav.items[id]

    // set item as focused
    nav.focused = item

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
    if (item.type === "file") {
      // file name, size, and type
      dom.itemName.innerHTML = "name: " + item.name
      dom.itemSize.innerHTML = "size: " + item.size
      dom.itemType.innerHTML = "type: " + item.filetype

      // file link
      dom.linkLabel.innerHTML = "link:"
      const completeLink = "https://" + username + ".hmpg.io/" + item.link
      dom.linkValue.innerHTML = item.link
      dom.linkValue.href = completeLink

      // file preview
      if (item.filetype.split("/")[0] === "image") {
        dom.previewImage.src = completeLink
      } else {
        dom.previewImage.src = "https://via.placeholder.com/150/"
      }
    } else {
      // directory name
      dom.itemName.innerHTML = "name: " + item.name

      // directory size
      let suffix
      if (item.children.length === 1) {
        suffix = " item"
      } else {
        suffix = " items"
      }
      dom.itemSize.innerHTML = "size: " + item.children.length + suffix

      // directory type
      dom.itemType.innerHTML = "type: directory"

      // directory link
      dom.linkLabel.innerHTML = "link:"
      const completeLink = "https://" + username + ".hmpg.io/" + item.link
      dom.linkValue.innerHTML = item.link
      dom.linkValue.href = completeLink

      // directory preview
      dom.previewImage.src = "https://via.placeholder.com/150/"
    }
  }

  // display and collapse directories
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

  // return values and functions so other files can use them
  return {
    assembleFileList: assembleFileList
  }
})()

// filesystem explorer and editor
const edit = (() => {
  // dom objects
  let dom

  // cookie variables
  let settings

  // store info
  let info

  // init function
  async function init(domObjects) {
    // populate cookie variables
    const cookies = document.cookie.split("; ")
    for (let i = 0; i < cookies.length; i++) {
      const currentCookie = cookies[i].split("=")
      if (currentCookie[0] === "settings") {
        settings = JSON.parse(decodeURIComponent(currentCookie[1]))
      }
    }

    // dom objects
    dom = domObjects


    // set value of link input to default
    dom.linkInput.value = settings.defaultDirectoryLinkLength

    // event listeners
    dom.directoryButton.addEventListener("click", handleDirectory)
    dom.renameButton.addEventListener("click", handleRename)
    dom.moveButton.addEventListener("click", handleMove)
    dom.deleteButton.addEventListener("click", handleDelete)

    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    await nav.assembleFileList(info, domObjects, false)
  }

  // send directory creation request
  function handleDirectory() {
    // create a FormData object for ajax requests
    const directoryForm = new FormData()

    // append directory to form data
    directoryForm.append('directory', dom.directoryInput.value)

    // make sure length isn't too long
    if (dom.linkInput.value > 16) {
      return
    }

    // append length to form data
    directoryForm.append('length', dom.linkInput.value)

    // create a new ajax request
    const request = new XMLHttpRequest()

    // prepare to receive response
    request.addEventListener("readystatechange", async () => {
      if (request.readyState == 4) {
        const response = JSON.parse(request.response)

        if (response.success === true) {
          await renderFileList()
        }
      }
    })

    // send request
    request.open("POST", "https://hmpg.io/files")
    request.send(directoryForm)
  }

  // send move request
  function handleMove() {
    // determine if any files are selected
    if (nav.selected.length > 0) {
      // prompt user for new name
      const path = window.prompt("Please enter the new location.")
      if (path) {
        // create array of links used to identify items later
        const paths = []
        for (let i = 0; i < nav.selected.length; i++) {
          const item = JSON.parse(JSON.stringify(nav.items[nav.selected[i]]))
          paths[i] = item.path
          paths[i].push(item.name)
        }

        // create a new ajax request
        const request = new XMLHttpRequest()

        // prepare to receive response
        request.addEventListener("readystatechange", async () => {
          if (request.readyState == 4) {
            await renderFileList()
          }
        })

        // send request
        request.open("POST", "https://hmpg.io/moveFiles")
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
        request.send(JSON.stringify({paths: paths, path: path}))
      }
    }
  }

  // send delete request
  function handleDelete() {
    // determine if any files are selected
    if (nav.selected.length > 0) {
      // store confirm result
      let result

      // send confirm message
      if (nav.selected.length === 1) {
        result = confirm("Are you sure you want to delete 1 file?")
      } else {
        result = confirm("Are you sure you want to delete " + nav.selected.length + " files?")
      }

      // check if user confirmed or not
      if (result === true) {
        // create array of links used to identify items later
        const paths = []
        for (let i = 0; i < nav.selected.length; i++) {
          const item = JSON.parse(JSON.stringify(nav.items[nav.selected[i]]))
          paths[i] = item.path
          paths[i].push(item.name)
        }

        // create a new ajax request
        const request = new XMLHttpRequest()

        // prepare to receive response
        request.addEventListener("readystatechange", async () => {
          if (request.readyState == 4) {
            await renderFileList()
          }
        })

        // send request
        request.open("POST", "https://hmpg.io/deleteFiles")
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
        request.send(JSON.stringify(paths))
      }
    }
  }

  // send rename request
  function handleRename() {
    // determine if a file is selected
    if (nav.focused) {
      // determine name and path
      const name = nav.focused.name
      const path = nav.focused.path
      path.push(name)

      // prompt user for new name
      const newName = window.prompt("Please enter the new filename.", name)
      if (newName) {
        if (nav.focused.fileType) {
          // concatename and verify filetype
          const type = "." + nav.focused.fileType.split("/")[1]
          if (!newName.endsWith(type)) {
            alert("New name does not match filetype. Please try again.")
            handleRename()
            return
          }
        }

        // create a new ajax request
        const request = new XMLHttpRequest()

        // prepare to receive response
        request.addEventListener("readystatechange", async () => {
          if (request.readyState == 4) {
            await renderFileList()
          }
        })

        // send request
        request.open("POST", "https://hmpg.io/renameFiles")
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
        request.send(JSON.stringify({path: path, name: newName}))
      }
    }
  }

  // re-render file list dom
  async function renderFileList() {
    // remove current list if it exists
    const fileList = document.querySelector("#fileList")
    if (fileList) {
      fileList.remove()
    }

    // setup new list
    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    nav.assembleFileList(info, dom, false)
  }


  // return values and functions so other files can use them
  return {
    init: init
  }
})()

// filesystem explorer for specific directories
const explore = (() => {
  async function init(domObjects, targetid, targetPath) {
    // dom objects
    dom = domObjects
    info = await fs.sendPartialRequest(targetid, targetPath)
    await nav.assembleFileList(info, domObjects, true)
  }
  // return values and functions so other files can use them
  return {
    init: init
  }
})()

// image gallery
const gallery = (() => {
  // return values and functions so other files can use them
  return {
  }
})()
