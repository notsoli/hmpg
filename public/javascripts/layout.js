// waits until html data is loaded
window.onload = init

// dom objects
let profile, submenu

// init function
function init() {
  // dom objects
  profile = document.getElementById("nav-profile")
  wrapper = document.getElementById("nav-wrapper")
  submenu = document.getElementById("nav-submenu")
  arrow = document.getElementById("nav-arrow")

  // event listeners
  if (profile) {
    wrapper.addEventListener("mouseover", showDropdown)
    wrapper.addEventListener("mouseleave", hideDropdown)
    arrow.addEventListener("mouseover", showDropdown)
    arrow.addEventListener("mouseleave", hideDropdown)
  } else {
    arrow.style.display = "none"
  }

  // this feels a bit hack-y, but it works for now
  submenu.addEventListener("mouseover", showDropdown)
  submenu.addEventListener("mouseleave", hideDropdown)
}

// shows the dropdown
function showDropdown() {
  submenu.className = "active"
  arrow.innerHTML = "▲"
}

// hides the dropdown
function hideDropdown() {
  submenu.className = "inactive"
  arrow.innerHTML = "▼"
}
