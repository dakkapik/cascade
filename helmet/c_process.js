const { spawn, exec } = require("child_process");
const path = require("path");

const lib = {}

lib.cDir = path.resolve(path.join(__dirname,'src'))
lib.pyDir = path.resolve(path.join(__dirname,'py'))

//*TODO:
/// process to check install of wirepi and install

lib.runBuild = () => {
    return new Promise((resolve, rejects) => {
        exec('gcc -Wall -o a mpu.c main.c -lwiringPi', {
            'cwd': lib.cDir
        }, (err, stdout, stderr) => {
            if(!err) {
                // change this, something better
                console.log('subprocess stdout: ', Buffer.from(stdout).toString())
                console.log('subprocess stderr: ', Buffer.from(stderr).toString())
                resolve()
            } else {
                rejects("Subprocess error: ", err)
            }
    
        })
    })
}

lib.spawnChild = () => {
    console.log('\x1b[32m%s\x1b[0m', "SPAWING GYRO LISTENER...")

    return spawn('./a', [] ,{
        stdio: ['ignore', 'pipe', process.stderr],
        cwd: lib.cDir
    })
}


lib.spawnPyBuild = () => {
    console.log('\x1b[32m%s\x1b[0m', "SPAWING GYRO LISTENER...")

    return spawn('python', ['gyro.py'], {
        stdio: ['ignore', 'pipe', process.stderr],
        cwd: lib.pyDir
    })
}

module.exports = lib;