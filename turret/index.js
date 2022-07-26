'use strict'

const { io } = require("socket.io-client")
const config = require("./config")
const {spawn, exec } = require('child_process')
const path = require("path")

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

    function runBuild () {
        return new Promise((resolve, rejects) => {
            exec('gcc main.cpp -lwiringPi  -lpthread -lstdc++', {
                'cwd': path.resolve(path.join(__dirname,'src'))
            }, (err, stdout, stderr) => {
                if(!err) {
                    // change this, something better
                    console.log('subprocess stdout: ', Buffer.from(stdout).toString())
                    console.log('subprocess stderr: ', Buffer.from(stderr).toString())
                    socket.emit("error", {device, err: Buffer.from(stderr).toString()})
                    resolve()
                } else {
                    
                    socket.emit("error", {device, err})
                    rejects("Subprocess error: ", err)
                }
        
            })
        })
    }

    socket.on("init-turret", async () => {
        console.log("initializing turret")
        try {
            if(linux) {
                await runBuild()
                console.log("starting child")
                const child = spawn('./a.out', [] , {
                    stdio: ['pipe','pipe', process.stderr],
                    cwd: path.resolve(path.join(__dirname,'src'))
                })

                child.stdout.on('data', (data) =>{
                    socket.emit("turret-data", data)
                })
                
                socket.on("set-angles", (command) => {
                    console.log(command.x)
                    child.stdin.write(command.x +' '+command.y + '\r\n')
                })

            } else {
                socket.on('set-angles', (command) => {
                    console.log("angles recieved: ", command)
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