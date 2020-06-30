// database manipulation functions

const mysql = require('mysql')
const hash = require('./hash')

// create a list of invalid usernames
const invalidUsernames = []

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
  sql.query(compareInfo, [username, hashedPassword](err, result) => {
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
          user: username
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
  // check if username is too long
  if (username.length <= 16) {
    // check if username is too short
    if (username.length >= 3) {
      // check if username contains special characters
      const expression = new RegExp(/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/)
      if (!expression.test(username)) {
        // check if username is in list of invalid usernames
        let isValid = true
        const lowerUser = username.toLowerCase()
        for (let i = 0; i < invalidUsernames.length; i++) {
          if (invalidUsernames[i] === lowerUser) {
            isValid = false
          }
        }
        if (isValid) {
          // check if password is too long
          if (password.length <= 32) {
            // check if password is too short
            if (password.length >= 8) {
              // check if password matches confirmed password
              if (password === confirmpassword) {
                return {
                  result: true,
                }
              } else {
                return {
                  result: false,
                  reason: "passwords do not match"
                }
              }
            } else {
              return {
                result: false,
                reason: "password is shorter than 8 characters"
              }
            }
          } else {
            return {
              result: false,
              reason: "password is longer than 32 characters"
            }
          }
        } else {
          return {
            result: false,
            reason: "username is invalid"
          }
        }
      } else {
        return {
          result: false,
          reason: "username contains special characters"
        }
      }
    } else {
      return {
        result: false,
        reason: "username is shorter than 3 characters"
      }
    }
  } else {
    return {
      result: false,
      reason: "username is longer than 16 characters"
    }
  }
}

// allows other files to use database functions
module.exports.login = login
module.exports.register = register
module.exports.validity = validity
