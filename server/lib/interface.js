const lib = {}

lib.content = {}

lib.animate = (frameRate) => {
    setInterval(()=> {
        console.clear()
        lib.renderItems()
    }, frameRate)
}

lib.update = () => {
    console.clear()
    lib.renderItems()
} 

lib.renderItems = () => {
    Object.values(lib.content).forEach((value) => {
        console.log(value)
    })
}

lib.addItem = (user, item, expire = 0, color) => {
    // TODO: 
    ///ADD COLOR DEPENDING ON IMPORTANCE^^^^
    // COLOR SWITCH BASED ON IMPORTANCE
    const key = Date.now()
    if(expire > 0) {
        setTimeout(()=>{
            delete lib.content[key]
            lib.update()
        }, expire)
    }
    lib.content[key] = `> ${user}: ${item}`
    lib.update()
    return key
}

lib.updateItem = (key, update) => {
    lib.content[key] = update
}

module.exports = lib;