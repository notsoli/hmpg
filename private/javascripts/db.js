// database manipulation functions
const mysql = require('mysql')
const hash = require('./hash')
const file = require('./file')
const handle = require('./error').handle
const e = require('../../config/errors.json')
const usernameList = require('../../config/invalidUsernames.json')

// creates references to invalid usernames and terms for easy use
const invalidUsernames = usernameList.invalidUsernames
const invalidTerms = usernameList.invalidTerms

// set up sql connection
const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "hmpg"
}

// allow sql to be used with promises
class Database {
  constructor(config) {this.connection = mysql.createConnection(config)}
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) {return reject(err)}
        resolve(rows)
      })
    })
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) {return reject(err)}
        resolve()
      })
    })
  }
}

const sql = new Database(config)

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
async function userid(username, callback) {
  try {
    const selectid = "SELECT userid FROM userinfo WHERE username = ?;"
    const queryResult = await sql.query(selectid, [username])

    // make sure result is an actual entry identification
    if (queryResult.length == 0) {
      callback({success: false, error: e.validity.invalidUsername})
      return
    }

    callback({success: true, userid: queryResult[0].userid})
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// use the sql database to check login information & create a jwt if valid
async function login(username, password, callback) {
  try {
    // converts plaintext password into hashed password
    const hashedPassword = hash.password(password)

    // compare username and password to database
    const compareInfo = "SELECT * FROM userinfo WHERE username = ? AND password = ?;"
    const queryResult = await sql.query(compareInfo, [username, hashedPassword])

    // make sure result is an actual entry identification
    if (queryResult.length !== 1 || queryResult[0].username !== username || queryResult[0].password !== hashedPassword) {
      callback({success: false, error: e.validity.invalidLogin})
      return
    }

    // create payload object
    const payload = {user: username, userid: queryResult[0].userid}

    // create a jwt
    const jwt = hash.sign(payload)
    callback({success: true, jwt: jwt})
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// use the sql database to register a new user
async function register(username, password, callback) {
  try {
    // converts plaintext password into hashed password
    const hashedPassword = hash.password(password)

    // creates a new date and converts it into seconds
    const registerDate = Math.floor(Date.now()/1000)

    // add new user to database
    const checkExisting = "INSERT IGNORE INTO userinfo(username, password, registerDate) VALUES(?, ?, ?)"
    const queryResult = await sql.query(checkExisting, [username, hashedPassword, registerDate])

    // checks if a new account was actually added
    if (queryResult.affectedRows != 0) {
      callback({success: true})
    } else {
      callback({success: false, error: e.validity.takenUsername})
    }
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// finds the directory of a static file
async function findDirectory(username, link, callback) {
  try {
    // find directory using username and link
    const findDirectory = "SELECT userid, directory FROM fileinfo WHERE userid IN (SELECT userid FROM userinfo WHERE username = ?) AND link = ?"
    const queryResult = await sql.query(findDirectory, [username, link])

    // checks if a directory was found
    if (queryResult.length > 0) {
      // return directory on success
      callback({success: true, result: queryResult[0]})
    } else {
      callback({success: false, error: ""})
    }
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// create an item link
async function link(id, directory, length, callback) {
  try {
    // store every link created by a user
    const links = [""]

    // get a list of all links created by a user
    const getLinks = "SELECT link FROM fileinfo WHERE userid = ?"
    const getResult = await sql.query(getLinks, id)

    // checks if any links were found
    if (getResult.length > 0) {
      for (let r = 0; r < getResult.length; r++) {
        links[r] = getResult[r].link
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
    const addResult = await sql.query(addLink, [id, fileLink, directory])

    // make sure a link was added
    if (addResult.affectedRows != 0) {
      // successful link creation
      callback({success: true, link: fileLink})
    } else {
      // failed link creation
      callback({success: false, error: e.link.failedLink})
    }
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// remove an item link
async function unlink(id, link, callback) {
  try {
    // get a list of all links created by a user
    const removeLink = "DELETE FROM fileinfo WHERE userid = ? AND link = ?"
    const queryResult = await sql.query(removeLink, [id, link])

    // checks if a row was deleted
    if (queryResult.affectedRows != 0) {
      // successful link deletion
      callback({success: true})
    } else {
      // failed link deletion
      callback({success: false, error: e.link.failedDelete})
    }
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
}

// rename an item link
async function rename(id, link, name, callback) {
  try {
    // get a list of all links created by a user
    const changeLink = "UPDATE fileinfo SET directory = ? WHERE userid = ? AND link = ?"
    const queryResult = await sql.query(changeLink, [name, id, link])

    // checks if a row was modified
    if (queryResult.affectedRows != 0) {
      // successful link modification
      callback({success: true})
    } else {
      // failed link modification
      callback({success: false, error: e.link.failedRename})
    }
  } catch (error) {
    console.log(error.message)
    callback({success: false, error: error.message})
  }
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
