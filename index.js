const os = require("os")
const sysname = os.hostname()
const linux = os.platform() === 'linux' ? true : false

if(linux) {
    const sysnames = ['raspi-gyro', 'raspi-server','raspi-turret'];
    const system = sysnames.indexOf(sysname) > -1 ? sysname : false;

    if(system) {
        console.log('\x1b[32m%s\x1b[0m', "initiating system: ", system, ' on raspberrypi')
        require(`./${system}/index`)(true, sysname)
    } else {
        console.log("hostname does not fit any subsystem description, cannot initiate...")
    }
} else {
    const sysnames = ['raspi-gyro', 'raspi-server','raspi-turret'];
    const system = sysnames.indexOf(process.env.sys) > -1 ? process.env.sys : false;
    
    if(system) {
        console.log('\x1b[32m%s\x1b[0m', "initiating system: ", system, " on mock mode")
        require(`./${system}/index`)(false, sysname)
    } else {
        console.error(new Error("process.env.sys requires a system name to start..."))
    }
}
