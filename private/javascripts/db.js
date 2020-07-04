// database manipulation functions

const mysql = require('mysql')
const hash = require('./hash')

// create a list of invalid usernames
const invalidUsernames = ['test']

// set up sql connection
const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hmpg"
})

// use the sql database to check login information & create a jwt if valid
function login(username, password, callback) {
  // converts plaintext password into hashed password
  const hashedPassword = hash.password(password)

  // compare username and password to database
  const compareInfo = "SELECT * FROM userinfo WHERE username = ? AND password = ?;"
  sql.query(compareInfo, [username, hashedPassword], (err, result) => {
    // check if result exists
    if (result.length > 0) {
      // make sure result is an actual entry identification
      if (result[0].username === username && result[0].password === hashedPassword) {
        // successful login attempt, create header object
        const header = {
          alg: "HS256",
          typ: "JWT"
        }

        // create payload object
        const payload = {
          user: username,
          userid: result[0].userid
        }

        // create a jwt
        const jwt = hash.sign(header, payload)
        callback({
          success: true,
          jwt: jwt
        })
      } else {
        // failed login attempt
        callback(false)
      }
    } else {
      // failed login attempt
      callback(false)
    }
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
    if (err) throw err
    // checks if a new account was actually added
    if (result.affectedRows != 0) {
      callback(true)
    } else {
      callback(false)
    }
  })
}

// check if username and password fit criteria for account creation and login
function validity(username, password, confirmpassword) {
  // verify username length
  if (username.length > 16) {
    return {result: false, reason: "username is longer than 16 characters"}
  } else if (username.length < 3) {
    return {result: false, reason: "username is shorter than 3 characters"}
  }

  // verify password length
  if (password.length > 32) {
    return {result: false, reason: "password is longer than 32 characters"}
  } else if (password.length < 8) {
    return {result: false, reason: "password is shorter than 8 characters"}
  }

  // verify that passwords match
  if (password !== confirmpassword) {
    return {result: false, reason: "passwords do not match"}
  }

  // verify that username is alphanumeric
  const expression = new RegExp(/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/)
  if (expression.test(username)) {
    return {result: false, reason: "username contains special characters"}
  }

  // verify that username is allowed
  const lowerUser = username.toLowerCase()
  for (let i = 0; i < invalidUsernames.length; i++) {
    if (invalidUsernames[i] === lowerUser) {
      return {result: false, reason: "username is invalid"}
    }
  }

  return {result: true}
}

// finds the directory of a static file
function findDirectory(username, link, callback) {
  // find directory using username and link
  const findDirectory = "SELECT userid, directory FROM fileinfo WHERE userid IN (SELECT userid FROM userinfo WHERE username = ?) AND link = ?"

  sql.query(findDirectory, [username, link], (err, result) => {
    if (err) throw err

    // checks if a directory was found
    if (result.length > 0) {
      // return directory on success
      callback(result[0])
    } else {
      // return nothing on failure
      callback()
    }
  })
}

// create a file link
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
    let unique = false

    // store the number of repeats
    let repeats = 1

    // store created link
    let fileLink

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
        callback({success: false, error: "failed to generate unique link"})
      }

      // increment repeats
      repeats++
    }

    // add the new link to the fileinfo database
    const addLink = "INSERT IGNORE INTO fileinfo(userid, link, directory) VALUES(?, ?, ?)"

    sql.query (addLink, [id, fileLink, directory], (err, result) => {
      if (err) throw err

      if (result.affectedRows != 0) {
        // successful link creation
        callback({success: true, link: fileLink})
      } else {
        // failed link creation
        callback({success: false, error: "failed to create link"})
      }
    })
  })
}

// allows other files to use database functions
module.exports.login = login
module.exports.register = register
module.exports.validity = validity
module.exports.findDirectory = findDirectory
module.exports.link = link
