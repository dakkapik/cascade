const { io } = require("socket.io-client")
const config = require("./config")
const {runBuild, spawnChild} = require("./child");

module.exports = ( linux, device, interface ) => {
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
                await runBuild(socket);
                
                console.log("starting child");

                const child = await spawnChild();

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
            interface.alert("ALERT: ", err , 10 * 1000)
            if(linux) {
                
                socket.emit("error", {device, err: JSON.stringify(err)})
            } else {
                console.error(err)
            }
        }
    })

}