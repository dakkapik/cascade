module.exports = (io, app, interface) => {

  const Gauge = require("../class/Gauge")

  const digitalGyro = new Gauge()

  const lib = {}
  lib.devices = {}
  lib.deviceLogId = interface.addItem("DEVICE", JSON.stringify(lib.devices))

  io.on("connection", (socket) => {
      socket.on("purpose", (purpose) => lib.handleConnect(purpose, socket.id))

      socket.on("mouse-pos", lib.handleMouseControl)
      
      socket.on("gyro-command", lib.handleGyroCommand)

      socket.on("turret-command", lib.handleTurretCommand)

      socket.on("disconnect", (reason) => lib.handleDisconnect(reason, socket.id))

      socket.on("turret-data", (data) => console.log(Buffer.from(data).toString()))

      socket.on("gyro-sample-trigger", () => {
        interface.addItem('SERVER', 'CALCULATING FILTER', 1000 * 30)
        digitalGyro.calcFilter()
      })

      socket.on("gyro-data", (data) => {
        console.log(data)
        digitalGyro.updateValue(data)

        //TODO: 
        // change this to only target turret if there is no mock
        
        if(!digitalGyro.sampleMode) io.emit("turret-command", digitalGyro.getAngles())
      })

      // ERRORS EXPIRE? ON FIX ERROR? 
      // DEFINETLY HIGH IMPORTANCE
      socket.on("error", (error) => interface.addItem("SERVER", error, 1000 * 120))
  });




  lib.handleTurretCommand = ( command ) => io.to(lib.devices['raspi-turret']).emit('turret-command', command)

  lib.handleGyroCommand = ( command ) => io.to(lib.devices['raspi-gyro']).emit("gyro-command", command)
  
  lib.handleMouseControl = ( data ) => {
    io.to(lib.devices['raspi-turret']).emit("turret-command", data)
  }

  lib.handleConnect = (purpose, socketId) => {

    lib.devices[purpose] = socketId

    interface.updateItem(lib.deviceLogId, lib.devices)
    
    if (purpose === 'raspi-helmet') io.to(socketId).emit("init-gyro")
    if (purpose === 'raspi-turret') io.to(socketId).emit('init-turret')
  }
  
  lib.handleDisconnect = ( reason, socketId )  => {
    Object.entries(lib.devices).forEach(([key, value]) => {
      if(socketId === value){
        delete lib.devices[key]
        interface.updateItem(lib.deviceLogId, lib.devices)
        interface.addItem("SERVER", key + "disconnected, reason: "+ reason, 30 * 1000)
      }
    })
  }
}

