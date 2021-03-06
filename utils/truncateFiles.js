const mysql = require('mysql')

// set up prompt
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

// set up sql connection
const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "hmpg"
}

const sql = mysql.createConnection(config)

// ask for confirmation
readline.question("Are you sure you want to truncate the fileinfo table? (y/N): ", (input) => {
  readline.close()
  if (input === "y" || input === "Y") {
    sql.query("TRUNCATE TABLE fileinfo", (err) => {
      if (err) throw err
      console.log("Successfully truncated fileinfo")
      process.exit()
    })
  } else {
    console.log("Truncate aborted")
  }
})
