const lib = {}

lib.content = {}
lib.users = {}
lib.digitalGyro = {}

lib.animate = (frameRate) => {
    setInterval(()=> {
        console.clear()
        lib.renderItems()
    }, frameRate)
}

lib.update = () => {
    console.clear()
    lib.render()
} 

lib.render = () => {

    if(Object.keys(lib.users).length > 0){
        console.log("CONNECTED DEVICES")
        console.table(lib.users)
    }

    if(Object.keys(lib.digitalGyro).length > 0){
        console.log("DIGITAL GYROSCOPE STATE")
        console.table(lib.digitalGyro)
    }

    Object.values(lib.content).forEach(({msg, emitter, color})=> {
        if(color) {
            console.log(color, `> ${emitter.toUpperCase()}: ${msg}`)
        } else {
            console.log(`> ${emitter.toUpperCase()}: ${msg}`)
        }
    })
}

lib.alert = (emitter, msg, expire = 0, color) => {
    // TODO: 
    ///ADD COLOR DEPENDING ON IMPORTANCE  ^^^^
    // COLOR SWITCH BASED ON IMPORTANCE
    const key = Date.now()
    if(expire > 0) {
        setTimeout(()=>{
            delete lib.content[key]
            lib.update()
        }, expire)
    }

    lib.content[key] = {emitter ,msg, color}
    lib.update()
    return key
}

lib.removeAlert = (id) => {
    delete lib.content[id]
    lib.update()
}

lib.updateUsers = ( users ) => {
    lib.users = users
    lib.update()
}

lib.updateGaugeDisplay = ( gauge ) => {
    lib.digitalGyro = {...gauge}
}

lib.updateAlert = (key, update) => {
    lib.content[key].msg = update
    lib.update()
}

module.exports = lib;