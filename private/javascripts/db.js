// database manipulation functions

const mysql = require('mysql')
const hash = require('./hash')
const file = require('./file')
const e = require('../../config/errors.json')
const usernameList = require('../../config/invalidUsernames.json')

// creates references to invalid usernames and terms for easy use
const invalidUsernames = usernameList.invalidUsernames
const invalidTerms = usernameList.invalidTerms

// set up sql connection
const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hmpg"
})

// check if username and password fit criteria for account creation and login
function validity(username, password, confirmpassword) {
  // verify username length
  if (username.length > 16) {
    return {result: false, reason: e.validity.longUsername}
  } else if (username.length < 3) {
    return {result: false, reason: e.validity.shortUsername}
  }

  // verify password length
  if (password.length > 32) {
    return {result: false, reason: e.validity.longPassword}
  } else if (password.length < 8) {
    return {result: false, reason: e.validity.shortPassword}
  }

  // verify that passwords match
  if (password !== confirmpassword) {
    return {result: false, reason: e.validity.differentPassword}
  }

  // verify that username is alphanumeric
  const expression = new RegExp(/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/)
  if (expression.test(username)) {
    return {result: false, reason: e.validity.specialUsername}
  }

  // verify that username is allowed
  const lowerUser = username.toLowerCase()
  for (let i = 0; i < invalidUsernames.length; i++) {
    if (invalidUsernames[i] === lowerUser) {
      return {result: false, reason: e.validity.invalidUsername}
    }
  }

  return {result: true}
}

// gets userid from username
function userid(username, callback) {
  const selectid = "SELECT userid FROM userinfo WHERE username = ?;"
  sql.query(selectid, [username], (err, result) => {
    // make sure result is an actual entry identification
    if (result.length == 0) {
      callback({success: false, error: e.validity.invalidUsername})
      return
    }

    callback({success: true, userid: result[0].userid})
  })
}

// use the sql database to check login information & create a jwt if valid
function login(username, password, callback) {
  // converts plaintext password into hashed password
  const hashedPassword = hash.password(password)

  // compare username and password to database
  const compareInfo = "SELECT * FROM userinfo WHERE username = ? AND password = ?;"
  sql.query(compareInfo, [username, hashedPassword], (err, result) => {
    // make sure result is an actual entry identification
    if (result.length !== 1 || result[0].username !== username || result[0].password !== hashedPassword) {
      callback({success: false, error: e.validity.invalidLogin})
      return
    }

    // create payload object
    const payload = {user: username, userid: result[0].userid}

    // create a jwt
    const jwt = hash.sign(payload)
    callback({success: true, jwt: jwt})
  })
}

// use the sql database to register a new user
function register(username, password, callback) {
  // converts plaintext password into hashed password
  const hashedPassword = hash.password(password)

  // creates a new date and converts it into seconds
  const registerDate = Math.floor(Date.now()/1000)

  // add new user to database
  const checkExisting = "INSERT IGNORE INTO userinfo(username, password, registerDate) VALUES(?, ?, ?)"

  sql.query(checkExisting, [username, hashedPassword, registerDate], (err, result) => {
    // checks if a new account was actually added
    if (result.affectedRows != 0) {
      callback({success: true})
    } else {
      callback({success: false, error: e.validity.takenUsername})
    }
  })
}

// finds the directory of a static file
function findDirectory(username, link, callback) {
  // find directory using username and link
  const findDirectory = "SELECT userid, directory FROM fileinfo WHERE userid IN (SELECT userid FROM userinfo WHERE username = ?) AND link = ?"

  sql.query(findDirectory, [username, link], (err, result) => {
    // checks if a directory was found
    if (result.length > 0) {
      // return directory on success
      callback({success: true, result: result[0]})
    } else {
      callback({success: false, error: ""})
    }
  })
}

// create an item link
function link(id, directory, length, callback) {
  // store every link created by a user
  const links = [""]

  // get a list of all links created by a user
  const getLinks = "SELECT link FROM fileinfo WHERE userid = ?"

  sql.query(getLinks, id, (err, result) => {
    if (err) throw err

    // checks if any links were found
    if (result.length > 0) {
      for (let r = 0; r < result.length; r++) {
        links[r] = result[r].link
      }
    }

    // used to determine if a unique link has been created
    let unique = false, repeats = 1, fileLink

    // repeat until a uniqle link is found
    while (!unique) {
      // generate a random link
      fileLink = hash.alphanumeric(length)

      // iterate through each link
      unique = true
      for (let l = 0; l < links.length; l++) {
        // compare it to the newly created link
        if (links[l] == fileLink) {
          unique = false
        }
      }

      // check if the repeats has exceeded 100
      if (repeats >= 100) {
        callback({success: false, error: e.link.overlapLink})
      }

      repeats++
    }

    // add the new link to the fileinfo database
    const addLink = "INSERT IGNORE INTO fileinfo(userid, link, directory) VALUES(?, ?, ?)"

    sql.query(addLink, [id, fileLink, directory], (err, result) => {
      if (result.affectedRows != 0) {
        // successful link creation
        callback({success: true, link: fileLink})
      } else {
        // failed link creation
        callback({success: false, error: e.link.failedLink})
      }
    })
  })
}

// remove an item link
function unlink(id, link, callback) {
  // get a list of all links created by a user
  const removeLink = "DELETE FROM fileinfo WHERE userid = ? AND link = ?"

  sql.query(removeLink, [id, link], (err, result) => {
    if (err) {
      callback({success: false, error: err})
    }

    // checks if a row was deleted
    if (result.affectedRows != 0) {
      // successful link deletion
      callback({success: true})
    } else {
      // failed link deletion
      callback({success: false, error: e.link.failedDelete})
    }
  })
}

// rename an item link
function rename(id, link, name, callback) {
  // get a list of all links created by a user
  const changeLink = "UPDATE fileinfo SET directory = ? WHERE userid = ? AND link = ?"

  sql.query(changeLink, [name, id, link], (err, result) => {
    if (err) {
      callback({success: false, error: err})
    }

    // checks if a row was modified
    if (result.affectedRows != 0) {
      // successful link modification
      callback({success: true})
    } else {
      // failed link modification
      callback({success: false, error: e.link.failedRename})
    }
  })
}

// allows other files to use database functions
module.exports.validity = validity
module.exports.login = login
module.exports.register = register
module.exports.userid = userid
module.exports.findDirectory = findDirectory
module.exports.link = link
module.exports.unlink = unlink
module.exports.rename = rename
