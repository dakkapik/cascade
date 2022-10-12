'use strict'
const c_process = require("./c_process")

const child = c_process.spawnPyBuild()

child.stdout.on('data', (data) =>{
    console.log(data)
})


child.stderr.on("data", (data) => {
    console.error("ERROR: ",data)
})