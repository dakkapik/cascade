'use strict'
const { spawn } = require("child_process")
const path = require("path")
const c_process = require("./c_process")

const child = c_process.spawnPyBuild()

child.stdout.pipe(process.stdout)

// const child = spawn('python', ['test.py'], {
//     stdio: ['ignore', 'pipe', 'ignore'],
//     cwd: path.resolve(path.join(__dirname,'py'))
// })

child.stdout.pipe(process.stdout)