module.exports = (app) => {
    const path = require("path")

    app.get("/", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../public/index.html'))
    })

    app.get("/mouse-control", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../public/mouse-control.html'))
    })

    app.get("/turret-control", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../public/turret-control.html'))
    })

    app.get("/gyro-control", (req, res)=> {
        res.sendFile(path.resolve(__dirname + '/../public/gyro-control.html'))
    })
}