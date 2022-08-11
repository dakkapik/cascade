module.exports = ( linux, device, interface ) => {
    const { getIP } = require("./lib/helper");
    const port = process.env.PORT || 5000;

    const express = require("express");
    const app = express();
    const http = require('http');
    const server = http.createServer(app);
    const { Server } = require("socket.io");

    const io = new Server(server);

    app.use(express.static("public"))

    const ip = getIP()
    
    require("./lib/router")(app)
    require("./lib/socket")(io, app, interface)

    server.listen(port, ()=>{
        interface.alert('SERVER', 'listening on : http://' + ip + ":" + port, 1000 * 10)
    })

}

