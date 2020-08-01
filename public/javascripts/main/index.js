// store if user is at the top of page
let topOfPage = true

// store dom elements
let nav, getStartedButton, introArrow, features, featuresArrow, account

// wait until page is loaded
window.addEventListener('load', init)

function init() {
  // populate dom objects
  nav = document.querySelector("#nav")
  getStartedButton = document.querySelector("#getStartedButton")
  introArrow = document.querySelector("#introArrow")
  features = document.querySelector("#features")
  featuresArrow = document.querySelector("#featuresArrow")
  account = document.querySelector("#account")

  // event listeners
  document.addEventListener('scroll', handleScroll)

  getStartedButton.addEventListener('click', () => {
    window.scroll({
      top: account.offsetTop - 50,
      left: 0,
      behavior: 'smooth'
    })
  })

  introArrow.addEventListener('click', () => {
    window.scroll({
      top: features.offsetTop - 50,
      left: 0,
      behavior: 'smooth'
    })
  })

  featuresArrow.addEventListener('click', () => {
    window.scroll({
      top: account.offsetTop - 50,
      left: 0,
      behavior: 'smooth'
    })
  })

  // simulate scroll event
  handleScroll()
}

// handle scroll event
function handleScroll() {
  if (window.pageYOffset) {
    if (topOfPage) {
      topOfPage = false
      showNav()
    }
  } else if (!topOfPage) {
    topOfPage = true
    incorporateNav()
  }
}

// incorporate nav bar into first panel
function incorporateNav() {
  nav.className = "nav-incorporated"
}

// return nav bar to its default state
function showNav() {
  nav.className = ""
}
