// filesystem explorer and editor
(() => {
  // wait for page to load
  window.addEventListener("load", init)

  // store info
  let info

  // dom objects
  let d, target

  // store nav
  let editNav

  // store selected elements
  let selected = []

  // store open interface
  let openInterface = "addInterface"

  // init function
  async function init() {
    // assemble dom
    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    editNav = new Nav({target: document.querySelector("#files")}, false, userInfo.user)
    await editNav.init(info)

    // append preview buttons to preview
    const buttonString = '<div id="previewActions" class="ui-button-collection"><div id="hmpgButton" class="ui-button">hmpg</div><div id="renameButton" class="ui-button">Rename</div></div>'
    const buttonInfo = new DOMParser().parseFromString(buttonString, 'text/html')
    document.querySelector("#previewContent").appendChild(buttonInfo.body.firstChild)

    // post init dom objects
    // why can i completely comment this thing out?
    d = {
      interfaces: document.querySelector("#interfaces"),
      selectedDisplay: document.querySelector("#selectedDisplay"),
      hmpgButton: document.querySelector("#hmpgButton"),
      renameButton: document.querySelector("#renameButton"),
      renameInput: document.querySelector("#renameInput"),
      renameCancel: document.querySelector("#renameCancel"),
      renameConfirm: document.querySelector("#renameConfirm"),
      addButton: document.querySelector("#addButton"),
      addDirectory: document.querySelector("#addDirectory"),
      addLink: document.querySelector("#addLink"),
      addDisplay: document.querySelector("#addDisplay"),
      addCancel: document.querySelector("#addCancel"),
      addConfirm: document.querySelector("#addConfirm"),
      moveButton: document.querySelector("#moveButton"),
      moveInput: document.querySelector("#moveInput"),
      moveCancel: document.querySelector("#moveCancel"),
      moveConfirm: document.querySelector("#moveConfirm"),
      deleteButton: document.querySelector("#deleteButton"),
      deleteCancel: document.querySelector("#deleteCancel"),
      deleteConfirm: document.querySelector("#deleteConfirm")
    }

    // append interfaces to preview
    document.querySelector("#preview").appendChild(d.interfaces)

    // event listeners
    const checkboxes = document.getElementsByClassName('itemCheckbox')
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('change', handleCheckboxClick)
    }

    d.renameButton.addEventListener("click", () => {handleInterfaceOpen("renameInterface")})
    d.addButton.addEventListener("click", () => {handleInterfaceOpen("addInterface")})
    d.moveButton.addEventListener("click", () => {handleInterfaceOpen("moveInterface")})
    d.deleteButton.addEventListener("click", () => {handleInterfaceOpen("deleteInterface")})

    const closeInterfaces = document.getElementsByClassName('closeInterface')
    for (let i = 0; i < closeInterfaces.length; i++) {
      closeInterfaces[i].addEventListener('click', handleInterfaceClose)
    }

    d.renameCancel.addEventListener("click", () => {
      document.querySelector("#renameInterface").style.display = "none"
    })
    d.renameConfirm.addEventListener("click", handleRename)

    d.addCancel.addEventListener("click", () => {
      document.querySelector("#addInterface").style.display = "none"
    })
    d.addConfirm.addEventListener("click", handleDirectory)

    d.deleteCancel.addEventListener("click", () => {
      document.querySelector("#deleteInterface").style.display = "none"
    })
    d.deleteConfirm.addEventListener("click", handleDelete)

    d.moveCancel.addEventListener("click", () => {
      document.querySelector("#moveInterface").style.display = "none"
    })
    d.moveConfirm.addEventListener("click", handleMove)

    d.addLink.value = userInfo.settings.defaultDirectoryLinkLength
  }

  // handle checkbox clicks
  function handleCheckboxClick() {
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

    // activate/deactivate elements
    if (selected.length > 0) {
      // show selected display
      d.selectedDisplay.innerHTML = "selected: " + selected.length + ((selected.length > 1) ? " items" : " item")
      d.selectedDisplay.style.display = "block"

      // activate buttons
      d.moveButton.className = "ui-button"
      d.deleteButton.className = "ui-button"
    } else {
      // hide selected display
      d.selectedDisplay.style.display = "none"

      // deactivate buttons
      d.moveButton.className = "ui-button ui-button-inactive"
      d.deleteButton.className = "ui-button ui-button-inactive"
    }
  }

  // handle interface opening
  function handleInterfaceOpen(newInterface) {
    // make sure there are items selected
    if ((newInterface === "moveInterface" || newInterface === "deleteInterface") && selected.length === 0) return

    document.querySelector("#" + openInterface).style.display = "none"
    document.querySelector("#" + newInterface).style.display = "block"
    openInterface = newInterface
  }

  // handle interface x button clicks
  function handleInterfaceClose() {
    this.parentNode.parentNode.style.display = "none"
  }

  // send directory creation request
  function handleDirectory() {
    // create a FormData object for ajax requests
    const directoryForm = new FormData()

    // append directory to form data
    directoryForm.append('directory', addDirectory.value)

    // append length to form data
    directoryForm.append('length', addLink.value)

    // append display style to form data
    directoryForm.append('display', addDisplay.value)

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
    if (selected.length > 0 && moveInput.value !== "") {
      // create array of links used to identify items later
      const paths = []
      for (let i = 0; i < selected.length; i++) {
        const item = JSON.parse(JSON.stringify(editNav.items[selected[i]]))
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
      request.send(JSON.stringify({paths: paths, path: moveInput.value}))
    }
  }

  // send delete request
  function handleDelete() {
    // determine if any files are selected
    if (selected.length > 0) {
      // create array of links used to identify items later
      const paths = []
      for (let i = 0; i < selected.length; i++) {
        const item = JSON.parse(JSON.stringify(editNav.items[selected[i]]))
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

  // send rename request
  function handleRename() {
    // determine if a file is selected
    if (editNav.focused) {
      // determine name and path
      const name = editNav.focused.name
      const path = editNav.focused.path
      path.push(name)

      if (editNav.focused.fileType) {
        // concatename and verify filetype
        const type = "." + editNav.focused.filetype.split("/")[1]
        if (!d.renameInput.value.endsWith(type)) return
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
      request.send(JSON.stringify({path: path, name: d.renameInput.value}))
    }
  }

  // re-render file list dom
  async function renderFileList() {
    // reset selected
    selected = []

    // move back current interfaces
    document.querySelector("#" + openInterface).style.display = "none"
    document.querySelector("#main").appendChild(d.interfaces)

    // remove current list if it exists
    const fileList = document.querySelector("#content")
    if (fileList) {
      fileList.remove()
    }

    // remove current preview if it exists
    const preview = document.querySelector("#preview")
    if (preview) {
      preview.remove()
    }

    // setup new list
    info = await fs.sendFullRequest()
    info = fs.addPaths(info)
    await editNav.init(info)

    // append interfaces to preview
    document.querySelector("#preview").appendChild(d.interfaces)

    // reset checkbox event listeners
    const checkboxes = document.getElementsByClassName('itemCheckbox')
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('change', handleCheckboxClick)
    }

    // reset buttons
    d.moveButton.className = "ui-button ui-button-inactive"
    d.deleteButton.className = "ui-button ui-button-inactive"

    // append preview buttons to preview
    document.querySelector("#previewContent").innerHTML += '<div id="previewActions" class="ui-button-collection"><div id="hmpgButton" class="ui-button">hmpg</div><div id="renameButton" class="ui-button">Rename</div></div>'
  }
})()
