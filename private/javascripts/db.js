// database manipulation functions
const mysql = require('mysql')
const hash = require('./hash')
const file = require('./file')
const info = require('./info')
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

function validity(username, password, confirmpassword) {
  // verify username length
  if (username.length > 16) {
    throw new Error(e.validity.longUsername)
  } else if (username.length < 3) {
    throw new Error(e.validity.shortUsername)
  }

  // verify password length
  if (password.length > 32) {
    throw new Error(e.validity.longPassword)
  } else if (password.length < 8) {
    throw new Error(e.validity.shortPassword)
  }

  // verify that passwords match
  if (password !== confirmpassword) {
    throw new Error(e.validity.differentPassword)
  }

  // verify that username is alphanumeric
  const expression = new RegExp(/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/)
  if (expression.test(username)) {
    throw new Error(e.validity.specialUsername)
  }

  // verify that username is allowed
  const lowerUser = username.toLowerCase()
  for (let i = 0; i < invalidUsernames.length; i++) {
    if (invalidUsernames[i] === lowerUser) {
      throw new Error(e.validity.invalidUsername)
    }
  }
}

// gets userid from username
async function userid(username) {
  const selectid = "SELECT userid FROM userinfo WHERE username = ?;"
  const queryResult = await sql.query(selectid, [username])

  // make sure result is an actual entry identification
  if (queryResult.length == 0) {
    throw new Error(e.validity.invalidUsername)
    return
  }

  return queryResult[0].userid
}

// use the sql database to check login information & create a jwt if valid
async function login(username, password) {
  // converts plaintext password into hashed password
  const hashedPassword = hash.password(password)

  // compare username and password to database
  const compareInfo = "SELECT * FROM userinfo WHERE username = ? AND password = ?;"
  const queryResult = await sql.query(compareInfo, [username, hashedPassword])

  // make sure result is an actual entry identification
  if (queryResult.length !== 1 || queryResult[0].username !== username || queryResult[0].password !== hashedPassword) {
    throw new Error(e.validity.invalidLogin)
  }

  // create settings object
  const settings = JSON.parse(await info.read(queryResult[0].userid)).settings
  console.log(settings)

  // create payload object
  const payload = {user: username, userid: queryResult[0].userid, settings: settings}

  // create a jwt
  const jwt = hash.sign(payload)

  return jwt
}

// use the sql database to register a new user
async function register(username, password) {
  // converts plaintext password into hashed password
  const hashedPassword = hash.password(password)

  // creates a new date and converts it into seconds
  const registerDate = Math.floor(Date.now()/1000)

  // add new user to database
  const checkExisting = "INSERT IGNORE INTO userinfo(username, password, registerDate) VALUES(?, ?, ?)"
  const queryResult = await sql.query(checkExisting, [username, hashedPassword, registerDate])

  // checks if a new account was actually added
  if (queryResult.affectedRows === 0) {
    throw new Error(e.validity.takenUsername)
  }
}

// finds the directory of a static file
async function findDirectory(username, link) {
  // find directory using username and link
  const findDirectory = "SELECT userid, directory FROM fileinfo WHERE userid IN (SELECT userid FROM userinfo WHERE username = ?) AND link = ?"
  const queryResult = await sql.query(findDirectory, [username, link])

  // checks if a directory was found
  if (queryResult.length > 0) {
    // return directory on success
    return queryResult[0]
  } else {
    throw new Error("directory not found")
  }
}

// create an item link
async function link(id, directory, length) {
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
      throw new Error(e.link.overlapLink)
    }

    repeats++
  }

  // add the new link to the fileinfo database
  const addLink = "INSERT IGNORE INTO fileinfo(userid, link, directory) VALUES(?, ?, ?)"
  const addResult = await sql.query(addLink, [id, fileLink, directory])

  // make sure a link was added
  if (addResult.affectedRows != 0) {
    // successful link creation
    return fileLink
  } else {
    // failed link creation
    throw new Error(e.link.failedLink)
  }
}

// remove an item link
async function unlink(id, directory) {
  // get a list of all links created by a user
  const removeLink = "DELETE FROM fileinfo WHERE userid = ? AND directory = ?"
  const queryResult = await sql.query(removeLink, [id, directory])

  // checks if a row was deleted
  if (queryResult.affectedRows === 0) {
    // failed link deletion
    throw new Error(e.link.failedDelete)
  }
}

// rename an item link
async function rename(id, directory, name) {
  // get a list of all links created by a user
  const changeLink = "UPDATE fileinfo SET directory = ? WHERE userid = ? AND directory = ?"
  const queryResult = await sql.query(changeLink, [name, id, directory])

  // checks if a row was modified
  if (queryResult.affectedRows === 0) {
    // failed link modification
    throw new Error(e.link.failedRename)
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
