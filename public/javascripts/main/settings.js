// wait until window is loaded
window.addEventListener('load', init)

// cookie variables
let settings

// main dom objects
let contentItems, menuItems

// security dom objects
let defaultFileLinkLength, defaultDirectoryLinkLength

// track the current active page
let activePage = "security"

function init() {
  // populate cookie variables
  const cookies = document.cookie.split("; ")
  for (let i = 0; i < cookies.length; i++) {
    const currentCookie = cookies[i].split("=")
    if (currentCookie[0] === "settings") {
      settings = JSON.parse(decodeURIComponent(currentCookie[1]))
    }
  }

  // populate main dom objects
  contentItems = document.getElementsByClassName("contentItem")
  menuItems = document.getElementsByClassName("menuItem")

  // populate security dom objects
  defaultFileLinkLength = document.querySelector("#defaultFileLinkLength")
  defaultDirectoryLinkLength = document.querySelector("#defaultDirectoryLinkLength")

  // main event listeners
  for (let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener('click', handleMenuClick)
  }
  document.querySelector("#confirmButton").addEventListener("click", handleSubmit)
  document.querySelector("#cancelButton").addEventListener("click", resetValues)

  resetValues()

  // select first menu item
  menuItems[1].click()
}

// handle menu item selection
function handleMenuClick() {
  // deselect the previous menu item
  document.querySelector("#" + activePage).className = "menuItem"
  document.querySelector("#" + activePage + "Content").style.display = "none"

  // select the menu item
  this.classList.add("activeItem")
  document.querySelector("#" + this.id + "Content").style.display = "block"

  // set the current active page
  activePage = this.id
}

function handleSubmit() {
  // create a FormData object for ajax requests
  let form = new FormData()

  // check if any values were changed
  let changed = false

  if (activePage === "account") {

  } else if (activePage === "security") {
    if (settings.defaultFileLinkLength != defaultFileLinkLength.value) {
      changed = true
      form.append("defaultFileLinkLength", defaultFileLinkLength.value)
    }
    if (settings.defaultDirectoryLinkLength != defaultDirectoryLinkLength.value) {
      changed = true
      form.append("defaultDirectoryLinkLength", defaultDirectoryLinkLength.value)
    }
  }

  if (changed) {
    // create a new ajax request
    const request = new XMLHttpRequest()

    // prepare to receive response
    request.addEventListener("readystatechange", handleSettingsResponse)

    // send request
    request.open("POST", "https://hmpg.io/settings")
    request.send(form)
  }
}

// handle request response
function handleSettingsResponse(message) {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)
    console.log(response)

    // check if login was successful
    if (response.success == true) {
      // redirect to index
      window.location.href = "https://hmpg.io/settings"
    } else {
      // set status as error message
      console.log(response.failed)
    }
  }
}

function resetValues() {
  defaultFileLinkLength.value = settings.defaultFileLinkLength
  defaultDirectoryLinkLength.value = settings.defaultDirectoryLinkLength
}
