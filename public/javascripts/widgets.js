// provides utilities for rendering specific widgets
// base for filesystem explorer
function Nav() {
  // store each file and directory
  let items = [], itemId = 0

  // store currently focused item
  let focused

  // dom objects
  let dom = {}

  // simple
  let simple

  // store target username
  let targetName

  // assemble fileList dom using info
  this.assembleFileList = (info, target, clientSimple, name) => {
    // reset information-storing variables
    items = [], itemId = 0, focused = undefined

    // create fileList div
    const list = document.createElement("div")
    list.id = "content"

    // iterate through base
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]
      // check if child is a file or directory
      if (child.type === "file") {
        list.appendChild(assembleFile(child))
      } else if (child.type === "directory") {
        const dirNodes = assembleDirectory(child)
        list.appendChild(dirNodes[0])
        list.appendChild(dirNodes[0])
      }
    }

    // set items
    this.items = items

    // set simple
    simple = clientSimple

    this.init(list, target, name)
  }

  // create file object
  function assembleFile(file) {
    // add to items
    items[itemId] = file

    // create item element
    const domString = '<div class="item" id="item-' + itemId + '"><input class="itemCheckbox" type="checkbox"/><div class="itemIcon fas fa-file"></div><div class="itemName">' + file.name + '</div></div>'
    const fileInfo = new DOMParser().parseFromString(domString, 'text/html')

    // add event listeners
    fileInfo.querySelector(".itemName").addEventListener("click", handleNameClick)

    // increment itemId
    itemId++

    // return completed element
    return fileInfo.body.firstChild
  }

  // create directory object
  function assembleDirectory(dir) {
    // add to items
    items[itemId] = dir

    // create dirInfo element
    const domString = '<div class="item" id="item-' + itemId + '"><input class="itemCheckbox" type="checkbox"/><div class="itemArrow fas fa-caret-right"></div><div class="itemName">' + dir.name + '</div></div>'
    const dirInfo = new DOMParser().parseFromString(domString, 'text/html')

    // add event listeners
    dirInfo.querySelector(".itemArrow").addEventListener("click", handleArrowClick)
    dirInfo.querySelector(".itemName").addEventListener("click", handleNameClick)

    // create child container
    const containerElement = document.createElement("div")
    containerElement.id = "item-" + itemId + "-children"
    containerElement.className = "itemChildren inactiveChildren"

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
        const dirNodes = assembleDirectory(child)
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
  function assemblePreview() {
    // create preview element
    const domString = '<div id="preview"><div id="previewWrapper"><div id="previewContent"><div id="imageWrapper"><img id="previewImage" src="https://picsum.photos/seed/hmpg/75"/></div><div id="previewTitle">...</div><div id="previewInfo">...</div></div></div><div class="hiddenDisplay" id="selectedDisplay"></div></div>'
    const previewInfo = new DOMParser().parseFromString(domString, 'text/html')

    dom.previewImage = previewInfo.querySelector("#previewImage")
    dom.previewTitle = previewInfo.querySelector("#previewTitle")
    dom.previewInfo = previewInfo.querySelector("#previewInfo")

    return previewInfo.body.firstChild
  }

  // add event listeners for objects
  this.init = (element, target, name) => {
    // create and append file preview
    target.appendChild(assemblePreview())

    // set name
    if (name) {
      targetName = name
    } else {
      targetName = userInfo.user
    }

    // reset buttons
    if (!simple) {
      // dom.hmpgTriggerButton.className = "inactiveButton"
      // dom.renameButton.className = "inactiveButton"
      // dom.moveButton.className = "inactiveButton"
      // dom.deleteButton.className = "inactiveButton"
    }

    // display/collapse icons
    const hideIcons = element.getElementsByClassName('hideIcon')
    for (let i = 0; i < hideIcons.length; i++) {
      hideIcons[i].addEventListener('click', handleIconClick)
    }

    // append created list
    target.appendChild(element)

    // click first element
    const firstItem = document.querySelector("#item-0")
    if (firstItem) {
      firstItem.querySelector(".itemName").click()
    }
  }

  // handle item selection
  function handleNameClick() {
    if (!simple) {
      // activate buttons
    }

    // get the object's item id
    const id = this.parentNode.id.split("-")[1]
    const item = items[id]

    // item name
    dom.previewTitle.innerHTML = item.name

    // item link
    const completeLink = "https://" + targetName + ".hmpg.io/" + item.link

    // determine if item is a file or directory
    if (item.type === "file") {
      // item info
      dom.previewInfo.innerHTML = 'type: ' + item.filetype + ' • size: ' + item.displaySize + ' • link: <a href="' + completeLink + '">' + item.link + '</a>'

      // file preview
      if (item.filetype.split("/")[0] === "image") {
        dom.previewImage.src = completeLink
      } else {
        dom.previewImage.src = "/images/file.png"
      }
    } else {
      // size suffix
      let suffix = ((item.children.length === 1) ? ' item' : ' items')

      // item info
      dom.previewInfo.innerHTML = 'type: directory • size: ' + item.children.length + suffix + ' • link: <a href="' + completeLink + '">' + item.link + '</a>'

      // directory preview
      dom.previewImage.src = "/images/directory.png"
    }

    // set new item as focused
    focused = item
  }

  // display and collapse directories
  function handleArrowClick() {
    // create container reference
    const id = this.parentNode.id

    // toggle or un-toggle directory
    const target = document.querySelector("#" + id + "-children")
    if (this.className.includes("activeArrow")) {
      // hide directory
      target.className = "itemChildren inactiveChildren"

      // remove active class
      this.className = "itemArrow fas fa-caret-right"
    } else {
      // show directory
      target.className = "itemChildren"

      // add active class
      this.className += " activeArrow"
    }
  }
}

// filesystem explorer for specific directories
function Explore() {
  // store nav
  const exploreNav = new Nav()

  this.init = async (target, info, name) => {
    await exploreNav.assembleFileList(info, target, false, name)
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

  // store object
  let galleryObject

  // store target username
  let targetName

  this.init = async (domObjects, info, name) => {
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

    // set name
    targetName = name

    // assemble gallery
    assembleGallery()
  }

  // generate gallery dom object
  function assembleGallery() {
    // store domString
    let domString

    if (images.length > 0) {
      // set selected
      selected = 0

      domString = '<div id="gallery"><div id="galleryWrapper"><img id="galleryContent" src="https://' + targetName + '.hmpg.io/' + images[0].link + '"/></div><div id="galleryPreviews"><img class="galleryPreview activePreview" id="galleryPreview-0" src="https://' + targetName + '.hmpg.io/' + images[0].link + '"/>'
      for (let i = 1; i < images.length; i++) {
        const image = images[i]
        domString += '<img class="galleryPreview" id="galleryPreview-' + i + '" src="https://' + targetName + '.hmpg.io/' + image.link + '"/>'
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
    galleryObject.querySelector("#galleryContent").src = "https://" + targetName + ".hmpg.io/" + images[id].link

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
