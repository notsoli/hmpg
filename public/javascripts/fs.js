// main filesystem script
const fs = (() => {
  // send request for entire filesystem
  function sendFullRequest() {
    return new Promise((resolve, reject) => {
      // create a new ajax request
      const request = new XMLHttpRequest()

      // prepare to receive response
      request.addEventListener("readystatechange", () => {
        if (request.readyState == 4) {
          // store request response
          const response = JSON.parse(request.response)

          // check if login was successful
          if (response.success == true) {
            resolve(JSON.parse(response.info))
          } else {
            reject(new Error(response.error))
          }
        }
      })

      // send request
      request.open("GET", "getFiles")
      request.send()
    })
  }

  // send request for partial filesystem (specific directory)
  function sendPartialRequest(userid, paths) {
    return new Promise((resolve, reject) => {
      // create a new ajax request
      const request = new XMLHttpRequest()

      // prepare to receive response
      request.addEventListener("readystatechange", () => {
        if (request.readyState == 4) {
          // store request response
          const response = JSON.parse(request.response)

          // check if request was successful
          if (response.success == true) {
            resolve(JSON.parse(response.info))
          } else {
            reject(new Error(response.error))
          }
        }
      })

      // send request
      request.open("POST", "getFiles")
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
      request.send(JSON.stringify({userid: userid, paths: paths}))
    })
  }

  // add paths to info object
  function addPaths(info) {
    // iterate through children
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]
      child.path = []

      // iterate through directory
      if (child.type === "directory") {
        addDirectory(child, [child.name])
      }
    }

    // return modified info object
    return info
  }

  // add path to directory
  function addDirectory(info, path) {
    // iterate through children
    for (let i = 0; i < info.children.length; i++) {
      const child = info.children[i]
      child.path = path

      // iterate through directory
      if (child.type === "directory") {
        const newPath = [...path]
        newPath.push(child.name)
        addDirectory(child, newPath)
      }
    }
  }

  // return values and functions so other files can use them
  return {
    sendFullRequest: sendFullRequest,
    sendPartialRequest: sendPartialRequest,
    addPaths: addPaths
  }
})()
