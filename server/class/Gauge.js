class Axis {
    constructor(name){
        //get sample rate time from super class
        this.prevAngle = 0;
        this.angle = 0;
        this.name = name;
        this.first = true;
    }
    
    updateValue( value ) {
        //TODO:
        //limit angle after full circle return to initial pos

        // using 2 for time, change to get from super class after
        const time = 1;
        const DEVIATION = 0
        // GET DEVIATION MULTIPLIER FROM SUPER CLASS
        this.prevAngle = this.angle
        this.angle = this.prevAngle - value + (time) * (this.angle - this.prevAngle - DEVIATION)/( 2 * 1000 * 131)
    
    }
}

class Gauge {
    constructor () {
        // CHANGE X Y Z TO ARRAY AND ASSUME AXIS 
        this.axis = {
            "x": new Axis("z"),
            "y": new Axis("y"),
            "z": new Axis("z")
        }
        this.sampleMode = true;
        this.sampleRepo = {
            x: [],
            y: [],
            z: []
        }
        this.filter = {};
        this.mean = {};
        this.standardDeviation = {};
        this.iteration = 0;
        // this.popSize = 200;
        // this.diviationMultiplier = 2;
        this.diviationMultiplier = 2;
        this.sampleRate = 1;
    }

    calcFilter () {
        this.calcAxisFilter('x')
        this.calcAxisFilter('y')
        this.calcAxisFilter('z')
        console.log(this.filter)
        this.sampleMode = false
        this.sampleRate = 2
    }

    calcAxisFilter( axis ) {
        const sampleData = this.sampleRepo[axis]

        let sumTotal = 0;

        for(let i = 0; i < sampleData.length; i++) sumTotal += sampleData[i]

        this.mean[axis] = sumTotal / sampleData.length

        let stdDiv = 0
        sampleData.forEach(value => stdDiv += (value - this.mean[axis])*(value - this.mean[axis]))
        stdDiv = Math.sqrt(stdDiv / (sampleData.length - 1))

        this.standardDeviation[axis] = stdDiv;
        this.filter[axis] = {top: this.mean[axis] + stdDiv * this.diviationMultiplier, bottom: this.mean[axis] - stdDiv * this.diviationMultiplier}
    }

    updateValue( data ) {
        if(this.sampleMode) {
            this.sampleRepo.x.push(data.x)
            this.sampleRepo.y.push(data.y)
            this.sampleRepo.z.push(data.z)
        } else {
            Object.entries(data).forEach(([key, value]) => {
                if(value > this.filter[key].top || value < this.filter[key].bottom) this.axis[key].updateValue(value * (this.sampleRate / 1000))
            })
        }
        
    }
    
    getAngles() {
        return {
            x: this.axis.x.angle,
            y: this.axis.y.angle,
            z: this.axis.z.angle
        }
    }
}

module.exports = Gauge;