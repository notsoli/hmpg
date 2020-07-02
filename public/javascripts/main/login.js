// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let usernameInput, passwordInput, loginButton, loginStatus

// init function
function init() {
  // dom objects
  usernameInput = document.getElementById("username")
  passwordInput = document.getElementById("password")
  loginButton = document.getElementById("loginButton")
  loginStatus = document.getElementById("loginStatus")

  // event listeners
  loginButton.addEventListener("click", sendLoginData)
}

// send form data to server
function sendLoginData() {
  // create a FormData object for ajax requests
  const loginForm = new FormData()

  // append username and password to form data
  loginForm.append('username', usernameInput.value)
  loginForm.append('password', passwordInput.value)

  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleResponse)

  // send request
  request.open("POST", "http://hmpg.io/login")
  request.send(loginForm)
}

// handle request response
function handleResponse(message) {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)
    console.log(response)

    // check if login was successful
    if (response.success == true) {
      // redirect to index
      window.location.href = "http://hmpg.io"
    } else {
      // set status as error message
      loginStatus.innerHTML = response.error
    }
  }
}
