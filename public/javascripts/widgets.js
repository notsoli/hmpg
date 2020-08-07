// provides utilities for rendering specific widgets
// base for filesystem explorer
function Nav(domObjects, simple, targetName) {
  // store each file and directory
  this.items = []
  this.itemId = 0

  // store currently focused item
  this.focused = null

  // dom objects
  const d = domObjects

  // simple
  this.simple = simple

  // store target username
  this.targetName = targetName

  // add event listeners for objects
  this.init = (info) => {
    // create and append file preview
    d.target.appendChild(this.assemblePreview())

    // create and append file list
    d.target.appendChild(this.assembleFileList(info))

    // click first element
    const firstItem = document.querySelector("#item-0")
    if (firstItem) {
      firstItem.querySelector(".itemName").click()
    }
  }

  // assemble fileList dom using info
  this.assembleFileList = (info) => {
    // reset information-storing variables
    this.items = [], this.itemId = 0, this.focused = null

    // create fileList div
    const list = document.createElement("div")
    list.id = "content"

    // iterate through base
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]
      // check if child is a file or directory
      if (child.type === "file") {
        list.appendChild(this.assembleFile(child))
      } else if (child.type === "directory") {
        const dirNodes = this.assembleDirectory(child)
        list.appendChild(dirNodes[0])
        list.appendChild(dirNodes[0])
      }
    }

    // return completed list
    return list
  }

  // create file object
  this.assembleFile = (file) => {
    // add to items
    this.items[this.itemId] = file

    // create item element
    const domString = '<div class="item" id="item-' + this.itemId + '"><input class="itemCheckbox" type="checkbox"/><img class="itemIcon" src=""><div class="itemName">' + file.name + '</div></div>'
    const fileInfo = new DOMParser().parseFromString(domString, 'text/html')

    // set correct icon
    const type = file.filetype.split("/")[0]
    const itemIcon = fileInfo.querySelector(".itemIcon")
    if (type === "image") {
      itemIcon.src = "/images/icons/file-image.png"
    } else if (type === "audio") {
      itemIcon.src = "/images/icons/file-audio.png"
    } else if (type === "video") {
      itemIcon.src = "/images/icons/file-video.png"
    } else {
      itemIcon.src = "/images/icons/file-default.png"
    }

    // add event listeners
    fileInfo.querySelector(".itemName").addEventListener("click", (event) => {this.handleNameClick(event.target)})
    
    if (!this.simple) {
      const linkCheckbox = new CustomEvent('linkCheckbox', {detail: fileInfo.querySelector(".itemCheckbox")})
      window.dispatchEvent(linkCheckbox)
    }

    // increment itemId
    this.itemId++

    // return completed element
    return fileInfo.body.firstChild
  }

  // create directory object
  this.assembleDirectory = (dir) => {
    // add to items
    this.items[this.itemId] = dir

    // create dirInfo element
    const domString = '<div class="item" id="item-' + this.itemId + '"><input class="itemCheckbox" type="checkbox"/><div class="itemArrow fas fa-caret-right"></div><div class="itemName">' + dir.name + '</div></div>'
    const dirInfo = new DOMParser().parseFromString(domString, 'text/html')

    // add event listeners
    dirInfo.querySelector(".itemArrow").addEventListener("click", (event) => {this.handleArrowClick(event.target)})
    dirInfo.querySelector(".itemName").addEventListener("click", (event) => {this.handleNameClick(event.target)})
    
    if (!this.simple) {
      const linkCheckbox = new CustomEvent('linkCheckbox', {detail: dirInfo.querySelector(".itemCheckbox")})
      window.dispatchEvent(linkCheckbox)
    }

    // create child container
    const containerElement = document.createElement("div")
    containerElement.id = "item-" + this.itemId + "-children"
    containerElement.className = "itemChildren inactiveChildren"

    // increment itemId
    this.itemId++

    // iterate through children of directory
    for (let i = 0; i < dir.children.length; i++) {
      const child = dir.children[i]

      // check if child is a file or directory
      if (child.type === "file") {
        // append file object
        containerElement.appendChild(this.assembleFile(child))
      } else if (child.type === "directory") {
        // recursively append directory object
        const dirNodes = this.assembleDirectory(child)
        containerElement.appendChild(dirNodes[0])
        containerElement.appendChild(dirNodes[0])
      }
    }

    // append container
    dirInfo.body.appendChild(containerElement)

    // return completed element
    return dirInfo.body.childNodes
  }

  // assemble preview dom
  this.assemblePreview = () => {
    // create preview element
    const domString = '<div id="preview"><div id="previewWrapper"><div id="previewContent"><div id="imageWrapper"><img id="previewImage" src=""/></div><div id="previewTitle">...</div><div id="previewInfo">...</div></div></div><div class="hiddenDisplay" id="selectedDisplay"></div></div>'
    const previewInfo = new DOMParser().parseFromString(domString, 'text/html')

    // add elements to dom object
    d.previewImage = previewInfo.querySelector("#previewImage")
    d.previewTitle = previewInfo.querySelector("#previewTitle")
    d.previewInfo = previewInfo.querySelector("#previewInfo")

    return previewInfo.body.firstChild
  }

  // handle item selection
  this.handleNameClick = (target) => {
    // get the object's item id
    const id = target.parentNode.id.split("-")[1]
    const item = this.items[id]

    // item name
    d.previewTitle.innerHTML = item.name

    // item link
    const completeLink = "https://" + targetName + ".hmpg.io/" + item.link

    // determine if item is a file or directory
    if (item.type === "file") {
      // item info
      d.previewInfo.innerHTML = 'type: ' + item.filetype + ' • size: ' + item.displaySize + ' • link: <a href="' + completeLink + '">' + item.link + '</a>'

      // set correct preview
      const type = item.filetype.split("/")[0]
      if (type === "image") {
        d.previewImage.src = completeLink
      } else if (type === "audio") {
        d.previewImage.src = "/images/icons/file-audio.png"
      } else if (type === "video") {
        d.previewImage.src = "/images/icons/file-video.png"
      } else {
        d.previewImage.src = "/images/icons/file-default.png"
      }
    } else {
      // size suffix
      let suffix = ((item.children.length === 1) ? ' item' : ' items')

      // item info
      d.previewInfo.innerHTML = 'type: directory • size: ' + item.children.length + suffix + ' • link: <a href="' + completeLink + '">' + item.link + '</a>'

      // directory preview
      if (item.children.length === 0) {
        d.previewImage.src = "/images/icons/directory-empty.png"
      } else {
        d.previewImage.src = "/images/icons/directory-full.png"
      }
    }

    // set focused
    this.focused = item
  }

  // display and collapse directories
  this.handleArrowClick = (target) => {
    // create container reference
    const id = target.parentNode.id

    // toggle or un-toggle directory
    const targetDirectory = document.querySelector("#" + id + "-children")
    if (target.className.includes("activeArrow")) {
      // hide directory
      targetDirectory.className = "itemChildren inactiveChildren"

      // remove active class
      target.className = "itemArrow fas fa-caret-right"
    } else {
      // show directory
      targetDirectory.className = "itemChildren"

      // add active class
      target.className += " activeArrow"
    }
  }
}

// filesystem explorer for specific directories
function Explore(domObjects, targetName) {
  // store nav
  const exploreNav = new Nav(domObjects, true, targetName)

  this.init = async (info) => {
    await exploreNav.init(info)
  }
}

// image gallery
function Gallery(domObjects, targetName) {
  // store images
  this.images = []

  // store dom
  const d = domObjects

  // store target username
  this.targetName = targetName

  // store selected image
  this.selected = null

  this.init = (info) => {
    // iterate through children
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]

      // determine if item is an image
      if (child.type === "file" && child.filetype.split("/")[0] === "image") {
        this.images.push(child)
      }
    }

    // assemble gallery
    this.assembleGallery()
  }

  // generate gallery dom object
  this.assembleGallery = () => {
    // store domString
    let domString

    if (this.images.length > 0) {
      // set selected
      this.selected = 0

      domString = '<div id="gallery"><div id="galleryWrapper"><img id="galleryContent" src="https://' + targetName + '.hmpg.io/' + this.images[0].link + '"/></div><div id="galleryPreviews"><img class="galleryPreview activePreview" id="galleryPreview-0" src="https://' + targetName + '.hmpg.io/' + this.images[0].link + '"/>'
      for (let i = 1; i < this.images.length; i++) {
        const image = this.images[i]
        domString += '<img class="galleryPreview" id="galleryPreview-' + i + '" src="https://' + targetName + '.hmpg.io/' + image.link + '"/>'
      }
      domString += '</div><div id="galleryButtons"><div id="leftButton">&lt;</div><div id="rightButton">&gt;</div></div></div>'
    } else {
      domString = '<div id="galleryWrapper"><div id="galleryContent"></div><div id="galleryPreviews"></div><div id="galleryButtons"><div id="leftButton">&lt;</div><div id="rightButton">&gt;</div></div></div>'
    }

    // parse string into dom object
    const domInfo = new DOMParser().parseFromString(domString, 'text/html')
    d.galleryObject = domInfo.body.firstChild

    // add event listeners
    const previews = d.galleryObject.getElementsByClassName("galleryPreview")
    for (let i = 0; i < previews.length; i++) {
      previews[i].addEventListener('click', (event) => {this.handlePreviewClick(event.target)})
    }
    d.galleryObject.querySelector("#leftButton").addEventListener('click', this.cycleLeft)
    d.galleryObject.querySelector("#rightButton").addEventListener('click', this.cycleRight)

    // append completed dom
    d.target.appendChild(d.galleryObject)
  }

  // handle preview click
  this.handlePreviewClick = (target) => {
    // get id
    const id = parseInt(target.id.split("-")[1])

    // activate preview
    target.classList.add("activePreview")

    // deactivate old preview
    d.galleryObject.querySelector("#galleryPreview-" + this.selected).className = "galleryPreview"

    // set new link
    d.galleryObject.querySelector("#galleryContent").src = "https://" + this.targetName + ".hmpg.io/" + this.images[id].link

    // set new id as selected
    this.selected = id
  }

  this.cycleLeft = () => {
    if (this.selected > 0) {
      d.galleryObject.querySelector("#galleryPreview-" + (this.selected - 1)).click()
    }
  }

  this.cycleRight = () => {
    if (this.selected < this.images.length - 1) {
      d.galleryObject.querySelector("#galleryPreview-" + (this.selected + 1)).click()
    }
  }
}
