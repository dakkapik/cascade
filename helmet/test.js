'use strict'
const c_process = require("./c_process")

const child = c_process.spawnPyBuild()

child.stdout.pipe(process.stdout)