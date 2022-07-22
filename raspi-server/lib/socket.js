module.exports = (io, app) => {
  const lib = {}
  lib.devices = {}

  io.on("connection", (socket) => {
      socket.on("purpose", (purpose) => lib.handleConnect(purpose, socket.id))

      socket.on("mouse-pos", lib.handleMouseControl)
      
      socket.on("gyro-command", lib.handleGyroCommand)

      socket.on("turret-command", lib.handleTurretCommand)

      socket.on("disconnect", (reason) => lib.handleDisconnect(reason, socket.id))

      socket.on("turret-data", (data) => console.log(Buffer.from(data).toString()))

      socket.on("gyro-data", (data) => console.log(Buffer.from(data).toString()))

      socket.on("error", (error) => console.log(error))
  });









  lib.handleTurretCommand = ( command ) => io.to(lib.devices['raspi-turret']).emit('turret-command', command)

  lib.handleGyroCommand = ( command ) => io.to(lib.devices['raspi-gyro']).emit("gyro-command", command)
  
  lib.handleMouseControl = ( data ) => {
    io.to(lib.devices['raspi-turret']).emit("turret-command", data)
  }

  lib.handleConnect = (purpose, socketId) => {
    console.log("> DEVICE joined: ", purpose)
    lib.devices[purpose] = socketId

    if (purpose === 'raspi-helmet') io.to(socketId).emit("init-gyro")
    if (purpose === 'raspi-turret') io.to(socketId).emit('init-turret')
  }
  
  lib.handleDisconnect = ( reason, socketId )  => {
    Object.entries(lib.devices).forEach(([key, value]) => {
      if(socketId === value){
        delete lib.devices[key]
        console.log("> DEVICE: ", key, "disconnected, reason: ", reason)
      }
    })
  }
}

