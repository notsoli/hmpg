// waits until html data is loaded
window.onload = init

// dom objects
let profile, submenu

// init function
function init() {
  // dom objects
  profile = document.getElementById("profile")
  submenu = document.getElementById("submenu")

  // event listeners
  profile.addEventListener("mouseover", showDropdown)
  profile.addEventListener("mouseleave", hideDropdown)

  // this feels a bit hack-y, but it works for now
  submenu.addEventListener("mouseover", showDropdown)
  submenu.addEventListener("mouseleave", hideDropdown)
}

// shows the dropdown
function showDropdown() {
  submenu.className = "active"
}

// hides the dropdown
function hideDropdown() {
  submenu.className = "inactive"
}
