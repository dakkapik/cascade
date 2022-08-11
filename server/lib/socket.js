module.exports = (io, app, interface) => {
  const Device = require("../class/Device")
  const Gauge = require("../class/Gauge")

  const digitalGyro = new Gauge()

  const lib = {}
  lib.devices = {}
  lib.deviceWaitingId = interface.alert("SERVER", "waiting for devices to connect...")

  io.on("connection", (socket) => {
      // reconnect fn
      interface.removeAlert(lib.deviceWaitingId)

      socket.on("purpose", (purpose) => lib.handleConnect(purpose, socket.id))

      socket.on("mouse-pos", lib.handleMouseControl)
      
      socket.on("gyro-command", lib.handleGyroCommand)

      socket.on("turret-command", lib.handleTurretCommand)

      socket.on("disconnect", (reason) => lib.handleDisconnect(reason, socket.id))

      socket.on("reconnect", (reconnect) => {
        interface.alert("server", reconnect)
      })

      socket.on("turret-data", (data) => console.log(Buffer.from(data).toString()))

      socket.on("gyro-sample-trigger", () => {
        digitalGyro.calcFilter()
        interface.alert('SERVER', 'calculated mock filter', 1000 * 20)
      })

      socket.on("gyro-data", (data) => {
        if(lib.dataStreamId === undefined) {
          lib.dataStreamId = interface.alert("helmet", data)
        } else {
          interface.updateAlert(lib.dataStreamId, data)
        }

        if(data.toString()[0] === '$'){
          digitalGyro.calcFilter()
          interface.alert('SERVER', 'calculated filter', 1000 * 20)
          //change sample rate
        } else {
          digitalGyro.parseDataStream(data)
          interface.updateGaugeDisplay(digitalGyro.getStateData())
        }

        //TODO: 
        // change this to only target turret if there is no mock
        
        if(!digitalGyro.sampleMode) io.emit("turret-command", digitalGyro.getAngles())
      })

      // ERRORS EXPIRE? ON FIX ERROR? 
      // DEFINETLY HIGH IMPORTANCE
      socket.on("error", (error) => interface.alert("SERVER", error, 1000 * 120))
  });

  lib.handleTurretCommand = ( command ) => io.to(lib.devices.id['turret']).emit('turret-command', command)

  lib.handleGyroCommand = ( command ) => io.to(lib.devices.id['helmet']).emit("gyro-command", command)
  
  lib.handleMouseControl = ( data ) => {
    io.to(lib.devices.id['turret']).emit("turret-command", data)
  }

  lib.handleConnect = (purpose, socketId) => {

    lib.devices[purpose] = new Device(socketId) 

    interface.updateUsers(lib.devices)
    
    if (purpose === 'helmet') io.to(socketId).emit("init-gyro")
    if (purpose === 'turret') io.to(socketId).emit('init-turret')
  }
  
  lib.handleDisconnect = ( reason, socketId )  => {
    const deviceArray = Object.entries(lib.devices)

    if(deviceArray.length === 1) {
      lib.deviceWaitingId = interface.alert("SERVER", "waiting for devices to connect...")
    }

    deviceArray.forEach(([key, value]) => {
      if(socketId === value.id){
        lib.devices[key].connected = false
        interface.updateUsers(lib.devices)
        interface.alert(key," disconnected, reason: "+ reason, 20 * 1000)
      }
    })
  }
}

