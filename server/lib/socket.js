module.exports = (io, app, interface) => {

  const Gauge = require("../class/Gauge")

  const digitalGyro = new Gauge()

  const lib = {}
  lib.devices = {}

  lib.deviceLogId = interface.updateUsers(lib.devices)

  io.on("connection", (socket) => {
      socket.on("purpose", (purpose) => lib.handleConnect(purpose, socket.id))

      socket.on("mouse-pos", lib.handleMouseControl)
      
      socket.on("gyro-command", lib.handleGyroCommand)

      socket.on("turret-command", lib.handleTurretCommand)

      socket.on("disconnect", (reason) => lib.handleDisconnect(reason, socket.id))

      socket.on("turret-data", (data) => console.log(Buffer.from(data).toString()))

      socket.on("gyro-sample-trigger", () => {
        interface.log('SERVER', 'CALCULATING FILTER', 1000 * 30)
        digitalGyro.calcFilter()
      })

      socket.on("gyro-data", (data) => {
        if(data.toString()[0] === '$'){
          digitalGyro.calcFilter()
          interface.log('SERVER', 'CALCULATING FILTER', 1000 * 30)
          //change sample rate
        } else {
          const gData = data.toString().split(' ')
          digitalGyro.updateValue({
            x: gData[0],
            y: gData[1],
            z: gData[2]
          })
        }

        //TODO: 
        // change this to only target turret if there is no mock
        
        if(!digitalGyro.sampleMode) io.emit("turret-command", digitalGyro.getAngles())
      })

      // ERRORS EXPIRE? ON FIX ERROR? 
      // DEFINETLY HIGH IMPORTANCE
      socket.on("error", (error) => interface.log("SERVER", error, 1000 * 120))
  });

  lib.handleTurretCommand = ( command ) => io.to(lib.devices['turret']).emit('turret-command', command)

  lib.handleGyroCommand = ( command ) => io.to(lib.devices['helmet']).emit("gyro-command", command)
  
  lib.handleMouseControl = ( data ) => {
    io.to(lib.devices['turret']).emit("turret-command", data)
  }

  lib.handleConnect = (purpose, socketId) => {

    lib.devices[purpose] = socketId

    interface.updateUsers(lib.devices)
    
    if (purpose === 'helmet') io.to(socketId).emit("init-gyro")
    if (purpose === 'turret') io.to(socketId).emit('init-turret')
  }
  
  lib.handleDisconnect = ( reason, socketId )  => {
    Object.entries(lib.devices).forEach(([key, value]) => {
      if(socketId === value){
        delete lib.devices[key]
        interface.updateUsers(lib.devices)
        interface.log("SERVER", key + "disconnected, reason: "+ reason, 30 * 1000)
      }
    })
  }
}

