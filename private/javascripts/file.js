// filesystem manipulation functions

const hash = require('./hash')

// move file into user filesystem
function download(file, info) {
  file.mv("E:/hmpg/" + info.id + "/" + file.name, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("successfully uploaded file")
    }
  })
}

module.exports.download = download
