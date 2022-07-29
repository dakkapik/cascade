class Axis {
    constructor(name){
        this.angle = 0;
        this.name = name;
    }

    updateValue( value ) {
        this.angle = value;
        this.draw()
    }
}

class Gauge {
    constructor () {
        // CHANGE X Y Z TO ARRAY AND ASSUME AXIS 
        this.values = {
            "X": new Axis("X"),
            "Y": new Axis("Y"),
            "Z": new Axis("Z")
        }
        
    }

    updateValue( data ) {
        Object.values(data).forEach( value => {
            this.values[value.axis].updateValue(value.angle)
        })
    }
    
    getAngles() {
        return Object.entries(this.values).map(([key, value]) => {
            return {axis: key, angle: value.angle}
        })
    }
}