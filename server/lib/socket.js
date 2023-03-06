const Device = require("../class/Device")
const Gauge = require("../class/Gauge")

let digitalGyro = new Gauge()

const lib = {}
lib.devices = {}
// lib.recievers = {}
// lib.emitters = {}

module.exports = (io, app, interface) => {
  /// interface super component here
  lib.interface = interface;
  lib.deviceWaitingId = lib.interface.alert("SERVER", "waiting for devices to connect...")
  lib.io = io;

  io.on("connection", (socket) => {
      lib.interface.removeAlert(lib.deviceWaitingId)

      socket.on("purpose", (purpose) => lib.recievers.connect(purpose, socket.id))

      socket.on("disconnect", (reason) => lib.recievers.disconnect(reason, socket.id))

      socket.on("mouse-pos", lib.recievers.mouseControl)

      socket.on("reset-digital-gyro", lib.recievers.resetDigitalGyro)

      socket.on("set-angle", lib.emitters.turretSetAngle)

      socket.on("gyro-data", lib.recievers.gyroData)

      socket.on('set-direction', (axis) => {
        const gData = axis.toString().split(' ')
        lib.emitters.turretSetAngle({
          x: gData[0],
          y: gData[1],
          z: gData[2]
        })
      })
      // ERRORS EXPIRE? ON FIX ERROR? 
      // DEFINETLY HIGH IMPORTANCE
      socket.on("error", ( error ) => lib.recievers.error(error, socket.id))
  });
}

lib.recievers = {
  gyroData:         (data) => {
    if(lib.devices['noice-graph']) lib.emitters.rawData(data)
    
    digitalGyro.parseDataStream(data)

    lib.interface.updateGaugeDisplay(digitalGyro.getStateData())
    lib.interface.updateAxisDisplay(digitalGyro.getAxisData())

    if(digitalGyro.sampleMode) return

    lib.emitters.turretSetAngle( digitalGyro.getAngles() )    
  },
  error:            (error, socketId) => {
    const deviceArray = Object.entries(lib.devices)

    for(let i = 0; i < deviceArray.length; i++) {
      const [ key, value ]  = deviceArray[i]
      if(socketId === value.id){
        lib.interface.alert(key, "ERROR: "+error, 1000*120)
        return
      } 
    }
    lib.interface.alert("UNDEFINED DEVICE", "ERROR: "+error, 1000*120)
  },
  resetDigitalGyro: () => {
    digitalGyro = new Gauge()
    lib.interface.alert("SERVER", "reseting digital gyroscope", 10 * 1000)
    lib.interface.updateGaugeDisplay(digitalGyro.getStateData())
  },
  mouseControl:     ( data ) => lib.emitters.turretSetAngle( data ),

  connect:          (purpose, socketId) => {

    lib.devices[purpose] = new Device(socketId) 
  
    lib.interface.updateUsers(lib.devices)
    
    if (purpose === 'helmet') {lib.emitters.initGyro(socketId); return}
    if (purpose === 'turret') {lib.emitters.initTurret(socketId); return}
  },
  disconnect:       ( reason, socketId )  => {
    const deviceArray = Object.entries(lib.devices)
  
    if(deviceArray.length === 1) {
      lib.deviceWaitingId = lib.interface.alert("SERVER", "waiting for devices to connect...")
    }
  
    deviceArray.forEach(([key, value]) => {
      if(socketId === value.id){
        lib.devices[key].connected = false
        lib.interface.updateUsers(lib.devices)
        lib.interface.alert(key," disconnected, reason: "+ reason, 20 * 1000)
      }
    })
  }
}


lib.emitters = {
  turretSetAngle:   (angle)    => {
    if(lib.devices['turret']) lib.io.to(lib.devices['turret'].id).emit("turret-set-angles", angle)
    if(lib.devices['mock-reciver']) lib.io.to(lib.devices['mock-reciver'].id).emit("set-angles", angle)
  },
  rawData:          (data)     => lib.io.to(lib.devices['noice-graph'].id).emit('raw-gyro-data', data),
  initTurret:       (socketId) => lib.io.to(socketId).emit('init-turret'),
  initGyro:         (socketId) => lib.io.to(socketId).emit("init-gyro")
}