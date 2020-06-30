// hash creation functions
const crypto = require('crypto')

// generate secret
const secret = token(32)

// create a sha256 hash out of user's password
function password(password) {
  const sha256 = crypto.createHash('sha256')
  const hash = sha256.update(password).digest('base64')
  return hash
}

// create a randomized string
function token(length) {
  return crypto.randomBytes(length).toString('hex');
}

// sign jwt
function sign(header, payload) {
  // convert the header to base64
  const stringHeader = JSON.stringify(header)
  const baseHeader = Buffer.from(stringHeader).toString("base64")

  // convert the payload to base64
  const stringPayload = JSON.stringify(payload)
  const basePayload = Buffer.from(stringPayload).toString("base64")

  // create signature
  const stringSignature = baseHeader + "." + basePayload
  const baseSignature = crypto.createHmac("sha256", secret).update(stringSignature).digest("hex")
  const jwt = baseHeader + "." + basePayload + "." + baseSignature
  return jwt
}

// verify jwt
function verify(jwt) {
  // keep track of the jwt's validity
  let validity = false

  // keep track of header and payload objects
  let headerResult, payloadResult

  // split the jwt into the header, payload, and signature
  const parsedString = jwt.split(".")

  // make sure there are 3 parts
  if (parsedString.length == 3) {
    // verify header object
    const decodedHeader = Buffer.from(parsedString[0], 'base64').toString("ascii")
    headerResult = validateJSON(decodedHeader)

    if (headerResult.validity) {
      // verify payload object
      const decodedPayload = Buffer.from(parsedString[1], 'base64').toString("ascii")
      payloadResult = validateJSON(decodedPayload)

      if (payloadResult.validity) {
        //verify the signature
        const stringSignature = parsedString[0] + "." + parsedString[1]
        const baseSignature = crypto.createHmac("sha256", secret).update(stringSignature).digest("hex")

        if (baseSignature === parsedString[2]) {
          validity = true
        }
      }
    }
  }

  // returns jwt validity
  if (validity) {
    // valid jwt
    return {
      validity: true,
      header: headerResult.object,
      payload: payloadResult.object
    }
  } else {
    // invalid jwt
    return {
      validity: false
    }
  }
}

// validates that a string is a json object
function validateJSON(string) {
  // tries to parse the json object, and if it fails, returns false
  let object
  try {
    object = JSON.parse(string)
  } catch (e) {
    return {
      validity: false
    }
  }
  return {
    validity: true,
    object: object
  }
}

// generate a payload using cookies
function payload(req, res, next) {
  // get a list of all cookies
  const cookies = req.cookies

  // jwt token
  if (cookies.jwtToken) {
    // verify jwt
    const jwt = verify(cookies.jwtToken, secret)

    if (jwt.validity == true) {
      // valid jwt
      console.log("valid jwt")

      // return the data contained in the jwt payload
      return jwt.payload
    } else {
      // invalid jwt
      console.log("invalid jwt")

      // destroy the jwtToken cookie
      res.clearCookie("jwtToken")
    }
  }

  // return empty object
  return {}
}

// allows other files to use hash functions
module.exports.secret = secret
module.exports.password = password
module.exports.token = token
module.exports.sign = sign
module.exports.verify = verify
module.exports.payload = payload
