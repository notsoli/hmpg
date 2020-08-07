// filesystem explorer and editor
(() => {
  // wait for page to load
  window.addEventListener("load", init)

  // store info
  let info

  // dom objects
  let d

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
      dropZone: document.querySelector("#dropZone"),
      interfaces: document.querySelector("#interfaces"),
      selectedDisplay: document.querySelector("#selectedDisplay"),
      hmpgButton: document.querySelector("#hmpgButton"),
      renameButton: document.querySelector("#renameButton"),
      renameInput: document.querySelector("#renameInput"),
      renameCancel: document.querySelector("#renameCancel"),
      renameConfirm: document.querySelector("#renameConfirm"),
      addButton: document.querySelector("#addButton"),
      addFileIcon: document.querySelector("#addFileIcon"),
      addDirectoryIcon: document.querySelector("#addDirectoryIcon"),
      addFile: document.querySelector("#addFile"),
      addDirectory: document.querySelector("#addDirectory"),
      directoryPath: document.querySelector("#directoryPath"),
      directoryLink: document.querySelector("#directoryLink"),
      directoryDisplay: document.querySelector("#directoryDisplay"),
      directoryCancel: document.querySelector("#directoryCancel"),
      directoryConfirm: document.querySelector("#directoryConfirm"),
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

    // open interfaces
    d.renameButton.addEventListener("click", () => {handleInterfaceOpen("renameInterface")})
    d.addButton.addEventListener("click", () => {handleInterfaceOpen("addInterface")})
    d.addFileIcon.addEventListener("click", () => {handleInterfaceOpen("uploadInterface")})
    d.addDirectoryIcon.addEventListener("click", () => {handleInterfaceOpen("directoryInterface")})
    d.addFile.addEventListener("click", () => {handleInterfaceOpen("uploadInterface")})
    d.addDirectory.addEventListener("click", () => {handleInterfaceOpen("directoryInterface")})
    d.moveButton.addEventListener("click", () => {handleInterfaceOpen("moveInterface")})
    d.deleteButton.addEventListener("click", () => {handleInterfaceOpen("deleteInterface")})

    // close interfaces
    const closeInterfaces = document.getElementsByClassName('closeInterface')
    for (let i = 0; i < closeInterfaces.length; i++) {
      closeInterfaces[i].addEventListener('click', handleInterfaceClose)
    }

    // confirm/cancel interfaces
    d.renameCancel.addEventListener("click", () => {
      document.querySelector("#renameInterface").style.display = "none"
      d.interfaces.style.display = "none"
    })
    d.renameConfirm.addEventListener("click", handleRename)

    d.directoryCancel.addEventListener("click", () => {
      document.querySelector("#directoryInterface").style.display = "none"
      d.interfaces.style.display = "none"
    })
    d.directoryConfirm.addEventListener("click", handleDirectory)

    d.deleteCancel.addEventListener("click", () => {
      document.querySelector("#deleteInterface").style.display = "none"
      d.interfaces.style.display = "none"
    })
    d.deleteConfirm.addEventListener("click", handleDelete)

    d.moveCancel.addEventListener("click", () => {
      document.querySelector("#moveInterface").style.display = "none"
      d.interfaces.style.display = "none"
    })
    d.moveConfirm.addEventListener("click", handleMove)

    // set default link length
    d.directoryLink.value = userInfo.settings.defaultDirectoryLinkLength

    // file uploads
    up.init({dropZone: d.dropZone, interfaces: d.interfaces,
      uploadInterface: document.querySelector("#uploadInterface"),
      uploadTarget: document.querySelector("#uploadContent")}, editNav)
  }

  window.addEventListener("linkCheckbox", (e) => {
    e.detail.addEventListener('change', handleCheckboxClick)
  })

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

  function resetSelected() {
    // clear selected
    selected = []
    
    // hide selected display
    d.selectedDisplay.style.display = "none"

    // deactivate buttons
    d.moveButton.className = "ui-button ui-button-inactive"
    d.deleteButton.className = "ui-button ui-button-inactive"

    // uncheck all checkboxes
    const checkboxes = document.querySelectorAll(".itemCheckbox")
    for (let checkbox of checkboxes) {
      checkbox.checked = false
    }
  }

  // handle interface opening
  function handleInterfaceOpen(newInterface) {
    // show interfaces
    d.interfaces.style.display = "block"

    // make sure there are items selected
    if ((newInterface === "moveInterface" || newInterface === "deleteInterface") && selected.length === 0) return

    document.querySelector("#" + openInterface).style.display = "none"
    document.querySelector("#" + newInterface).style.display = "block"
    openInterface = newInterface
  }

  // handle interface x button clicks
  function handleInterfaceClose() {
    // hide interfaces
    d.interfaces.style.display = "none"

    // hide selected interface
    this.parentNode.parentNode.style.display = "none"
  }

  // send directory creation request
  function handleDirectory() {
    // create a FormData object for ajax requests
    const directoryForm = new FormData()

    // append directory to form data
    directoryForm.append('directory', d.directoryPath.value)

    // append length to form data
    directoryForm.append('length', d.directoryLink.value)

    // append display style to form data
    directoryForm.append('display', d.directoryDisplay.value)

    // create a new ajax request
    const request = new XMLHttpRequest()

    // prepare to receive response
    request.addEventListener("readystatechange", async () => {
      if (request.readyState == 4) {
        const response = JSON.parse(request.response)

        if (response.success === true) {
          // get target item
          const targetPath = d.directoryPath.value.split("/")
          targetPath.pop()
          const completePath = [...targetPath]
          let targetItem

          if (targetPath.length > 0) {
            const targetName = targetPath.pop()
            let targetId
            for (let i = 0; i < editNav.items.length; i++) {
              const item = editNav.items[i]
              if (JSON.stringify(item.path) === JSON.stringify(targetPath) && item.name === targetName) {
                targetId = i
              }
            }
            targetItem = document.querySelector("#item-" + targetId + "-children")
          } else {
            targetItem = document.querySelector("#content")
          }

          // push new item to view
          response.item.path = [...completePath]
          editNav.items.push(response.item)
          const newItem = editNav.assembleDirectory(response.item)
          targetItem.appendChild(newItem[0])
          targetItem.appendChild(newItem[0])

          // close directory interface
          document.querySelector("#directoryInterface").style.display = "none"
        
          // open directories
          for (let p = 0; p < completePath.length; p++) {
            const dirName = completePath.pop()
            let dirId
            for (let i = 0; i < editNav.items.length; i++) {
              const item = editNav.items[i]
              if (item.name === dirName && JSON.stringify(item.path) === JSON.stringify(completePath)) {
                dirId = i
              }
            }

            const itemArrow = document.querySelector("#item-" + dirId + " .itemArrow")
            if (!itemArrow.classList.contains("activeArrow")) {
              itemArrow.click()
            }
          }
        }
      }
    })

    // send request
    request.open("POST", "https://hmpg.io/files")
    request.send(directoryForm)
  }

  // send move request
  function handleMove() {
    // store value of moveInput
    const path = d.moveInput.value

    // determine if any files are selected
    if (selected.length > 0 && path !== "") {
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
          const response = JSON.parse(request.response)
          if (response.success) {
            // get target item
            const newPath = path.split("/")
            const targetPath = [...newPath]
            const targetName = targetPath.pop()
            let targetId
            for (let i = 0; i < editNav.items.length; i++) {
              const item = editNav.items[i]
              if (JSON.stringify(item.path) === JSON.stringify(targetPath) && item.name === targetName) {
                targetId = i
              }
            }
            const targetItem = document.querySelector("#item-" + targetId + "-children")
            
            // iterate through each successful move
            for (let c = 0; c < response.completed.length; c++) {
              // get file id and item
              const id = selected[response.completed[c]]
              const item = document.querySelector("#item-" + id)
              
              // change item path
              editNav.items[id].path = [...newPath]

              // append item to targetItem
              targetItem.appendChild(item)
            }

            // close move interface
            document.querySelector("#moveInterface").style.display = "none"
            resetSelected()

            // open directories
            for (let p = 0; p < newPath.length; p++) {
              const dirName = newPath.pop()
              let dirId
              for (let i = 0; i < editNav.items.length; i++) {
                const item = editNav.items[i]
                if (item.name === dirName && JSON.stringify(item.path) === JSON.stringify(newPath)) {
                  dirId = i
                }
              }

              const itemArrow = document.querySelector("#item-" + dirId + " .itemArrow")
              if (!itemArrow.classList.contains("activeArrow")) {
                itemArrow.click()
              }
            }
          }
        }
      })

      // send request
      request.open("POST", "https://hmpg.io/moveFiles")
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
      request.send(JSON.stringify({paths: paths, path: path}))
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
          const response = JSON.parse(request.response)
          if (response.success) {
            for (let c = 0; c < response.completed.length; c++) {
              const id = selected[response.completed[c]]
              document.querySelector("#item-" + id).remove()
            }

            // close delete interface
            document.querySelector("#deleteInterface").style.display = "none"
            resetSelected()
          }
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
        if (request.readyState === 4) {
          const response = JSON.parse(request.response)
          if (response.success) {
            // rename item in items
            let id
            for (let i = 0; i < editNav.items.length; i++) {
              const item = editNav.items[i]
              if (item.link === editNav.focused.link) {
                item.name = d.renameInput.value
                id = i
              }
            }

            // find item element
            const itemElement = document.querySelector("#item-" + id)
            const itemName = itemElement.querySelector(".itemName")

            // rename item dom and reset preview
            itemName.innerHTML = d.renameInput.value
            itemName.click()

            // close rename interface
            document.querySelector("#renameInterface").style.display = "none"
          }
        }
      })

      // send request
      request.open("POST", "https://hmpg.io/renameFiles")
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
      request.send(JSON.stringify({path: path, name: d.renameInput.value}))
    }
  }
})()
