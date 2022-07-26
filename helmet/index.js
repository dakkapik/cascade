'use strict'
const { io } = require("socket.io-client")
const c_process = require("./c_process")
const config = require("./config")

module.exports = ( linux, device ) => {

    const serverURL = new URL("http://"+config.mainIP + ":"+config.httpPort)
    const socket = io (serverURL.href)

    socket.on("connect",() => {
        if(linux) {
            socket.emit("purpose", device)
        } else {
            socket.emit("purpose", 'raspi-helmet')
        }
    })

    
    socket.on("init-gyro", async () => {
        console.log("initializing gyroscope")
        try {
            if(linux) {
                await c_process.runBuild()
                const child = c_process.spawnChild()
    
                child.stdout.on('data', (data) =>{
                    // socket.emit('gyro-sample-trigger')
                    socket.emit("gyro-data", data)
                })
                
                // socket.on('gyro-command', (command) => {
                //     child.stdin.write(command + '\r\n')
                // })

                socket.on("disconnect", () => child.kill('SIGINT'))

            } else {
                socket.on('gyro-command', (command) => {
                    console.log("COMMAND REVIEVED: ", command)
                })
            }
        } catch (err) {
            if(linux) {
                socket.emit("error", {device, err})
            } else {
                console.error(err)
            }
        }
    })
}



