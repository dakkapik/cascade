'use strict'

const { io } = require("socket.io-client")
const config = require("./config")

module.exports = ( linux, device ) => {
    /// IMPORT MAIN IP FROM HERE ^^^
    const serverURL = new URL("http://"+config.mainIP + ":"+config.httpPort)
    const socket = io (serverURL.href)

    socket.on("connect",() => {
        if(linux) {
            socket.emit("purpose", device)
        } else {
            socket.emit("purpose", 'raspi-turret')
        }
    })

    socket.on("init-turret", async () => {
        console.log("initializing turret")
        try {
            if(linux) {
                const child = spawn('./a', [] , {
                    stdio: ['pipe','pipe', process.stderr],
                    cwd: path.resolve(path.join(__dirname,'src'))
                })

                child.on('data', (data) =>{
                    socket.emit("turret-data", data)
                })
                socket.on("turret-command", (command) => {
                    child.stdin.write(command + '\r\n')
                })

            } else {
                socket.on('turret-command', (command) => {
                    console.log("command recieved: ", command)
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