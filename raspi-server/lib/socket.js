const lib = {}
lib.devices = {}

module.exports = (io, app) => {
    io.on("connection", (socket) => {
        socket.on("purpose", (purpose) => lib.handleConnect(purpose, socket.id))

        socket.on("mouse-pos", (data) => { io.emit("canvas-pos", data) })

        socket.on("disconnect", (reason) => lib.handleDisconnect(reason, socket.id))
    });
}

lib.handleConnect = (purpose, socketId) => {
    console.log("> DEVICE joined: ", purpose)
    lib.devices[purpose] = socketId
}

lib.handleDisconnect = ( reason, socketId )  => {
    Object.entries(lib.devices).forEach(([key, value]) => {
      if(socketId === value){
        delete lib.devices[key]
        console.log("> DEVICE: ", key, "disconnected, reason: ", reason)
      }
    })
}
