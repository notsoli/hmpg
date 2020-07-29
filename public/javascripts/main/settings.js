// wait until window is loaded
window.addEventListener('load', init)

// cookie variables
let settings

// main dom objects
let contentItems, menuItems

// account dom objects
let newUsername, password, submitUsername, oldPassword, newPassword, confirmPassword, submitPassword

// store username and password for later login
let loginUsername, loginPassword

// security dom objects
let defaultFileLinkLength, defaultDirectoryLinkLength

// track the current active page
let activePage = "account"

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

  // populate account dom objects
  newUsername = document.querySelector("#newUsername")
  password = document.querySelector("#password")
  submitUsername = document.querySelector("#submitUsername")
  oldPassword = document.querySelector("#oldPassword")
  newPassword = document.querySelector("#newPassword")
  confirmPassword = document.querySelector("#confirmPassword")
  submitPassword = document.querySelector("#submitPassword")

  // populate security dom objects
  defaultFileLinkLength = document.querySelector("#defaultFileLinkLength")
  defaultDirectoryLinkLength = document.querySelector("#defaultDirectoryLinkLength")

  // main event listeners
  for (let i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener('click', handleMenuClick)
  }
  document.querySelector("#confirmButton").addEventListener("click", handleSubmit)
  document.querySelector("#cancelButton").addEventListener("click", resetValues)

  // account event listeners
  submitUsername.addEventListener("click", handleUsername)
  submitPassword.addEventListener("click", handlePassword)

  resetValues()
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

// submit username change request
function handleUsername() {
  // create a FormData object for ajax requests
  const form = new FormData()

  // create a new ajax request
  const request = new XMLHttpRequest()

  // append old password to form data
  form.append("newUsername", newUsername.value)
  loginUsername = newUsername.value

  // append new password to form data
  form.append("password", password.value)
  loginPassword = password.value

  // prepare to receive response
  request.addEventListener("readystatechange", handleChangeResponse)

  // send request
  request.open("POST", "https://hmpg.io/changeDetails")
  request.send(form)
}

// submit password change request
function handlePassword() {
  // make sure new password matches confirmed password
  if (newPassword.value !== confirmPassword.value) {
    return
  }

  // create a FormData object for ajax requests
  const form = new FormData()

  // create a new ajax request
  const request = new XMLHttpRequest()

  // set username
  loginUsername = document.querySelector("#nav-profile").innerHTML

  // append old password to form data
  form.append("oldPassword", oldPassword.value)

  // append new password to form data
  form.append("newPassword", newPassword.value)
  loginPassword = newPassword.value

  // prepare to receive response
  request.addEventListener("readystatechange", handleChangeResponse)

  // send request
  request.open("POST", "https://hmpg.io/changeDetails")
  request.send(form)
}

// handle account change response
function handleChangeResponse() {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)

    // check if change was successful
    if (response.success == true) {
      // create a FormData object for ajax requests
      const form = new FormData()

      // create a new ajax request
      const request = new XMLHttpRequest()

      // append old password to form data
      form.append("username", loginUsername)

      // append new password to form data
      form.append("password", loginPassword)

      // prepare to receive response
      request.addEventListener("readystatechange", handleLoginResponse)

      // send request
      request.open("POST", "https://hmpg.io/login")
      request.send(form)
    } else {
      // set status as error message
      console.log(response.error)
    }
  }
}

function handleLoginResponse() {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)
    console.log(response)

    // check if login was successful
    if (response.success == true) {
      // redirect to settings
      window.location.href = "https://hmpg.io/settings"
    } else {
      // set status as error message
      console.log(response.failed)
    }
  }
}

// submit setting change request
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

    // check if change was successful
    if (response.success == true) {
      // redirect to settings
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
