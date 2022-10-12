'use strict'
const c_process = require("./c_process")

try{
    const child = c_process.spawnPyBuild()

    child.stdout.on('data', (data) =>{
        console.log(data)
    })

    // child.stdout.pipe(process.stdout)

} catch (err) {
    console.error("ERROR: ", err)
}

