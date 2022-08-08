const lib = {}

lib.content = {}

lib.users = {}

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
    console.table(lib.users)
    Object.values(lib.content).forEach(({message, color})=> {
        if(color) {
            console.log(color, message)
        } else {
            console.log(message)
        }
    })
}

lib.log = (user, item, expire = 0, color) => {
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

    lib.content[key] = {message: `> ${user}: ${item}`, color}
    lib.update()
    return key
}

lib.updateUsers = ( users ) => {
    lib.users = users
    lib.update()
}

lib.updateItem = (key, update) => {
    lib.content[key] = update
}

module.exports = lib;