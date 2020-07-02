// waits until html data is loaded
window.addEventListener('load', init)

// dom objects
let usernameInput, passwordInput, confirmInput, registerButton, registerStatus

// init function
function init() {
  // dom objects
  usernameInput = document.getElementById("username")
  passwordInput = document.getElementById("password")
  confirmInput = document.getElementById("confirmpassword")
  registerButton = document.getElementById("registerButton")
  registerStatus = document.getElementById("registerStatus")

  // event listeners
  registerButton.addEventListener("click", sendRegisterData)
}

// send form data to server
function sendRegisterData() {
  // create a FormData object for ajax requests
  const registerForm = new FormData()

  // append username and password to form data
  registerForm.append('username', usernameInput.value)
  registerForm.append('password', passwordInput.value)
  registerForm.append('confirmpassword', confirmInput.value)

  // create a new ajax request
  const request = new XMLHttpRequest()

  // prepare to receive response
  request.addEventListener("readystatechange", handleResponse)

  // send request
  request.open("POST", "http://hmpg.io/register")
  request.send(registerForm)
}

// handle request response
function handleResponse(message) {
  if (this.readyState == 4) {
    // store request response
    const response = JSON.parse(this.response)
    console.log(response)

    // check if register was successful
    if (response.success == true) {
      // check if login was successful
      if (response.login == true) {
        // redirect to index
        window.location.href = "http://hmpg.io"
      } else {
        // redirect to login
        window.location.href = "http://hmpg.io/login"
      }
    } else {
      // set status as error message
      registerStatus.innerHTML = response.error
    }
  }
}
