'use strict';
const lib = {}

lib.getIP = () => {

    const nets = require('os').networkInterfaces();
    const results = Object.create(null); 
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                // select only self localhost ip
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    // if(process.platform === 'win32') ip = ipGet()["Ethernet"][0]
    switch(process.platform) {
        case "linux": return results["wlan0"][0]
        case "win32": return results["Wi-Fi"][0]
        case "darwin":return results["en0"][0]
        default: throw new Error("OPERATING SYSTEM NOT WITHIN SCOPE")
    }
}

module.exports = lib;
