const {spawn, exec } = require('child_process')
const path = require("path");

const lib = {};

lib.runBuild = ( socket ) => {
    return new Promise((resolve, rejects) => {
        exec('gcc main.cpp -lwiringPi  -lpthread -lstdc++', {
            'cwd': path.resolve(path.join(__dirname,'src'))
        }, (err, stdout, stderr) => {
            if(!err) {
                // change this, something better
                console.log('subprocess stdout: ', Buffer.from(stdout).toString())
                console.log('subprocess stdout: ', Buffer.from(stdout).toString())
                console.log('subprocess stderr: ', Buffer.from(stderr).toString())
                socket.emit("error", {device:"turret", err: Buffer.from(stderr).toString()})
                                        //^^^ this should come from global
                resolve()
            } else {
                // reject better
                // take socket out of this function
                socket.emit("error", {device:"turret", err})
                                    //^^^ this should come from global
                rejects("Subprocess error: ", err)
            }
    
        })
    })
}

lib.spawnChild = () => {
    return new Promise((resolve, reject) => {
        try{
            const child = spawn('./a.out', [] , {
                stdio: ['pipe','pipe', process.stderr],
                cwd: path.resolve(path.join(__dirname,'src'))
            })
            resolve(child)
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = lib;