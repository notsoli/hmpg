// provides utilities for rendering specific widgets
// base for filesystem explorer
function Nav() {
  // store each file and directory
  let items = [], itemId = 0

  // store currently selected items
  let selected = []

  // store currently focused item
  let focused

  // dom objects
  let dom

  // assemble fileList dom using info
  this.assembleFileList = (info, domObjects, simple) => {
    // reset information-storing variables
    items = [], itemId = 0, selected = [], focused = undefined

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

    // set items
    this.items = items

    this.init(list, domObjects, simple)
  }

  // create file object
  function assembleFile(file) {
    // add to items
    items[itemId] = file

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
    items[itemId] = dir

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

  // assemble preview dom
  function assemblePreview() {
    // create preview element
    const domString = '<div id="filePreview"><div id="imageWrapper"><img id="previewImage" src=""/></div><div id="previewInfo"><div id="itemName">name: ...</div><div id="itemSize">size: ...</div><div id="itemType">type: ...</div><div id="itemLink"><div id="linkLabel">link: ...</div><a id="linkValue" href=""></a></div></div></div>'
    const previewInfo = new DOMParser().parseFromString(domString, 'text/html')

    dom.itemName = previewInfo.querySelector("#itemName")
    dom.itemSize = previewInfo.querySelector("#itemSize")
    dom.itemType = previewInfo.querySelector("#itemType")
    dom.linkLabel = previewInfo.querySelector("#linkLabel")
    dom.linkValue = previewInfo.querySelector("#linkValue")
    dom.previewImage = previewInfo.querySelector("#previewImage")

    return previewInfo.body.firstChild
  }

  // add event listeners for objects
  this.init = (element, domObjects, simple) => {
    // assign dom objects
    dom = domObjects

    // create and append file preview
    dom.previewTarget.appendChild(assemblePreview())

    // reset buttons
    if (!simple) {
      dom.hmpgTriggerButton.className = "inactiveButton"
      dom.renameButton.className = "inactiveButton"
      dom.moveButton.className = "inactiveButton"
      dom.deleteButton.className = "inactiveButton"
    }

    // checkboxes
    if (!simple) {
      const checkboxes = element.getElementsByClassName('checkbox')
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', (req) => {this.handleItemCheck(req.target)})
      }
    }

    // file names
    const fileNames = element.getElementsByClassName('fileName')
    for (let i = 0; i < fileNames.length; i++) {
      fileNames[i].addEventListener('click', (req) => {this.handleItemSelect(req.target, simple)})
    }

    // directory names
    const dirNames = element.getElementsByClassName('dirName')
    for (let i = 0; i < dirNames.length; i++) {
      dirNames[i].addEventListener('click', (req) => {this.handleItemSelect(req.target, simple)})
    }

    // display/collapse icons
    const hideIcons = element.getElementsByClassName('hideIcon')
    for (let i = 0; i < hideIcons.length; i++) {
      hideIcons[i].addEventListener('click', handleIconClick)
    }

    // append created list
    dom.fileTarget.appendChild(element)

    // click first element
    const firstItem = document.querySelector("#item-0")
    if (firstItem) {
      const fileName = firstItem.querySelector(".fileName")
      if (fileName) {
        fileName.click()
      } else {
        firstItem.querySelector(".dirName").click()
      }
    }
  }

  // handle checkbox clicks
  this.handleItemCheck = (target) => {
    // get item id
    const id = target.parentNode.id.split("-")[1]

    // determine if checkbox is checked
    if (target.checked) {
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

    // activate/deactivate buttons
    if (selected.length > 0) {
      dom.moveButton.className = "activeButton"
      dom.deleteButton.className = "activeButton"
    } else {
      dom.moveButton.className = "inactiveButton"
      dom.deleteButton.className = "inactiveButton"
    }

    this.selected = selected
  }

  // handle item selection
  this.handleItemSelect = (target, simple) => {
    if (!simple) {
      // activate button
      dom.hmpgTriggerButton.className = "activeButton"
      dom.renameButton.className = "activeButton"
    }

    // get the object's item id
    const id = target.parentNode.id.split("-")[1]
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
    if (item.type === "file") {
      // file name, size, and type
      dom.itemName.innerHTML = "name: " + item.name
      dom.itemSize.innerHTML = "size: " + item.displaySize
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
        dom.previewImage.src = "/images/file.png"
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
      dom.previewImage.src = "/images/directory.png"
    }

    this.focused = focused
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
}

// filesystem explorer and editor
function Edit() {
  // dom objects

  // store info
  let info

  // store nav
  const editNav = new Nav()

  // init function
  this.init = async (domObjects) => {
    // dom objects
    dom = domObjects

    // set value of link input to default
    dom.linkInput.value = userInfo.settings.defaultDirectoryLinkLength

    // event listeners
    dom.hmpgTriggerButton.addEventListener("click", handleHmpg)
    dom.addTriggerButton.addEventListener("click", handleAdd)
    dom.directoryButton.addEventListener("click", handleDirectory)
    dom.renameButton.addEventListener("click", handleRename)
    dom.moveButton.addEventListener("click", handleMove)
    dom.deleteButton.addEventListener("click", handleDelete)

    const closePopups = document.getElementsByClassName("closePopup")
    for (let i = 0; i < closePopups.length; i++) {
      closePopups[i].addEventListener("click", closePopup)
    }

    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    await editNav.assembleFileList(info, domObjects, false)
  }

  // handle hmpg button clikc
  function handleHmpg() {
    // show popup and darken background
    dom.hmpgWrapper.style.display = "flex"
    dom.darken.style.display = "block"
  }

  // handle add button click
  function handleAdd() {
    // show popup and darken background
    dom.addWrapper.style.display = "flex"
    dom.darken.style.display = "block"
  }

  // close popup
  function closePopup() {
    // close popup and lighten background
    document.querySelector("#" + this.id + "Wrapper").style.display = "none"
    dom.darken.style.display = "none"
  }

  // send directory creation request
  function handleDirectory() {
    // create a FormData object for ajax requests
    const directoryForm = new FormData()

    // append directory to form data
    directoryForm.append('directory', dom.directoryInput.value)

    // append length to form data
    directoryForm.append('length', dom.linkInput.value)

    // append display style to form data
    directoryForm.append('display', dom.displayInput.value)

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
    if (editNav.selected.length > 0) {
      // prompt user for new name
      const path = window.prompt("Please enter the new location.")
      if (path) {
        // create array of links used to identify items later
        const paths = []
        for (let i = 0; i < editNav.selected.length; i++) {
          const item = JSON.parse(JSON.stringify(editNav.items[editNav.selected[i]]))
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
    if (editNav.selected.length > 0) {
      // store confirm result
      let result

      // send confirm message
      if (editNav.selected.length === 1) {
        result = confirm("Are you sure you want to delete 1 file?")
      } else {
        result = confirm("Are you sure you want to delete " + editNav.selected.length + " files?")
      }

      // check if user confirmed or not
      if (result === true) {
        // create array of links used to identify items later
        const paths = []
        for (let i = 0; i < editNav.selected.length; i++) {
          const item = JSON.parse(JSON.stringify(editNav.items[editNav.selected[i]]))
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
    if (editNav.focused) {
      // determine name and path
      const name = editNav.focused.name
      const path = editNav.focused.path
      path.push(name)

      // prompt user for new name
      const newName = window.prompt("Please enter the new filename.", name)
      if (newName) {
        if (editNav.focused.fileType) {
          // concatename and verify filetype
          const type = "." + editNav.focused.fileType.split("/")[1]
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

    // remove current preview if it exists
    const filePreview = document.querySelector("#filePreview")
    if (filePreview) {
      filePreview.remove()
    }

    // setup new list
    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    editNav.assembleFileList(info, dom, false)
  }
}

// filesystem explorer for specific directories
function Explore() {
  // store nav
  const exploreNav = new Nav()

  this.init = async (domObjects, info) => {
    // dom objects
    dom = domObjects
    await exploreNav.assembleFileList(info, domObjects, true)
  }
}

// image gallery
function Gallery() {
  // store images
  const images = []

  // store dom
  let dom

  // store selected image
  let selected

  // store username
  let username

  // store object
  let galleryObject

  this.init = async (domObjects, info) => {
    // store dom objects
    dom = domObjects

    // iterate through children
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]

      // determine if item is an image
      if (child.type === "file" && child.filetype.split("/")[0] === "image") {
        images.push(child)
      }
    }

    // assemble gallery
    assembleGallery()
  }

  // generate gallery dom object
  function assembleGallery() {
    // store domString
    let domString

    if (images.length > 0) {
      // get username
      username = window.location.host.split(".")[0]

      // set selected
      selected = 0

      domString = '<div id="gallery"><div id="galleryWrapper"><img id="galleryContent" src="https://' + username + '.hmpg.io/' + images[0].link + '"/></div><div id="galleryPreviews"><img class="galleryPreview activePreview" id="galleryPreview-0" src="https://' + username + '.hmpg.io/' + images[0].link + '"/>'
      for (let i = 1; i < images.length; i++) {
        const image = images[i]
        domString += '<img class="galleryPreview" id="galleryPreview-' + i + '" src="https://' + username + '.hmpg.io/' + image.link + '"/>'
      }
      domString += '</div><div id="galleryButtons"><div id="leftButton">&lt;</div><div id="rightButton">&gt;</div></div></div>'
    } else {
      domString = '<div id="galleryWrapper"><div id="galleryContent"></div><div id="galleryPreviews"></div><div id="galleryButtons"><div id="leftButton">&lt;</div><div id="rightButton">&gt;</div></div></div>'
    }

    // parse string into dom object
    const domInfo = new DOMParser().parseFromString(domString, 'text/html')
    galleryObject = domInfo.body.firstChild

    // add event listeners
    const previews = galleryObject.getElementsByClassName("galleryPreview")
    for (let i = 0; i < previews.length; i++) {
      previews[i].addEventListener('click', handlePreviewClick)
    }
    galleryObject.querySelector("#leftButton").addEventListener('click', cycleLeft)
    galleryObject.querySelector("#rightButton").addEventListener('click', cycleRight)

    // append completed dom
    dom.galleryTarget.appendChild(galleryObject)
  }

  // handle preview click
  function handlePreviewClick() {
    // get id
    const id = parseInt(this.id.split("-")[1])

    // activate preview
    this.classList.add("activePreview")

    // deactivate old preview
    galleryObject.querySelector("#galleryPreview-" + selected).className = "galleryPreview"

    // set new link
    galleryObject.querySelector("#galleryContent").src = "https://" + username + ".hmpg.io/" + images[id].link

    // set new id as selected
    selected = id
  }

  function cycleLeft() {
    if (selected > 0) {
      galleryObject.querySelector("#galleryPreview-" + (selected - 1)).click()
    }
  }

  function cycleRight() {
    if (selected < images.length - 1) {
      galleryObject.querySelector("#galleryPreview-" + (selected + 1)).click()
    }
  }
}
