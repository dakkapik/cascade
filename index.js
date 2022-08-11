const os = require("os")
const linux = os.platform() === 'linux' ? true : false
const sysnames = ['helmet', 'server','turret'];
const interface = require('./lib/interface')
// process.env.sys="server"
if(linux) {
    const sysname = process.env.sys ? process.env.sys : os.hostname()
    const system = sysnames.indexOf(sysname) > -1 ? sysname : false;

    if(system) {
        interface.alert(system, "initiating system: "+ system + ' on raspberrypi', 1000 * 20, '\x1b[32m%s\x1b[0m')
        require(`./${system}/index`)(true, sysname, interface)
    } else {
        console.error(new Error("hostname does not fit any subsystem description, cannot initiate..."))
    }
} else {
    const system = sysnames.indexOf(process.env.sys) > -1 ? process.env.sys : false;
    
    if(system) {
        interface.alert(system, "initiating system: "+ system.toUpperCase() + ' on mock mode', 1000 * 20, '\x1b[32m%s\x1b[0m')
        require(`./${system}/index`)(false, system, interface)
    } else {
        console.error(new Error("process.env.sys requires a system name to start..."))
    }
}
