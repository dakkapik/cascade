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
    return results
}

module.exports = lib;
