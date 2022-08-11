class Axis {
    constructor(name){
        //get sample rate time from super class
        this.prevAngularRate = 0;
        this.angle = 0;
        this.name = name;
    }
    
    updateAngle( incomingAngleRate ) {
        //TODO:
        //limit angle after full circle return to initial pos

        // using 2 for time, change to get from super class after
        const time = 1;
        const DEVIATION = 0
        // GET DEVIATION MULTIPLIER FROM SUPER CLASS
        
        this.angle = this.prevAngularRate + ((time * (incomingAngleRate - this.prevAngularRate + DEVIATION))/( 2 * 1000 * 131))
        this.prevAngularRate = incomingAngleRate
    }   
}

class Gauge {
    constructor () {
        // CHANGE X Y Z TO ARRAY AND ASSUME AXIS 
        this.axis = {
            "x": new Axis("x"),
            "y": new Axis("y"),
            "z": new Axis("z")
        }
        this.sampleMode = true;
        this.sampleRepo = {
            x: [],
            y: [],
            z: []
        }
        this.filter = {
            x: {top: 0, bottom:0},
            y: {top: 0, bottom:0},
            z: {top: 0, bottom:0}
        };
        this.filterActive = false;
        this.mean = {};
        this.standardDeviation = {};
        this.iteration = 0;
        // this.popSize = 200;
        // this.diviationMultiplier = 2;
        this.diviationMultiplier = 2;
        this.sampleRate = 1;
        //SAMPLE RATE MUST COME FROM ABOVE
        this.rawData = ''
    }

    reset() {
        this.zeroPosition()
        this.resetSampleMode()
    }

    zeroPosition () {
        this.axis.x.angle = 0
        this.axis.y.angle = 0
        this.axis.z.angle = 0
        this.axis.x.prevAngularRate = 0
        this.axis.y.prevAngularRate = 0
        this.axis.z.prevAngularRate = 0
    }

    resetSampleMode() {
        this.sampleMode = true;
        this.sampleRepo = {
            x: [],
            y: [],
            z: []
        }
        this.iteration = 0;
    }

    parseDataStream (string) {
        this.rawData = string
        const gData = string.toString().split(' ')
        this.updateValue({
            x: parseFloat(gData[0]),
            y: parseFloat(gData[1]),
            z: parseFloat(gData[2])
        })
    }

    getStateData() {
        if(this.sampleMode){
            return {
                values: {
                    diviationMultiplier: this.diviationMultiplier,
                    sampleRate: this.sampleRate,
                    sampleMode: this.sampleMode,
                    iteration: this.iteration,
                },
                dataStream: {stream: this.rawData},
            }
        } else {
            return {
                axis: {
                    x: this.axis.x.angle,
                    y: this.axis.y.angle,
                    z: this.axis.z.angle
                },
                filterTop: {
                    x: this.filter.x.top,
                    y: this.filter.y.top,
                    z: this.filter.z.top
                },
                filterBottom: {
                    x: this.filter.x.bottom,
                    y: this.filter.y.bottom,
                    z: this.filter.z.bottom
                },
                values: {
                    diviationMultiplier: this.diviationMultiplier,
                    sampleRate: this.sampleRate,
                    sampleMode: this.sampleMode,
                },
                dataStream: {stream: this.rawData}
            }
        }
    }

    calcFilter () {
        this.calcAxisFilter('x')
        this.calcAxisFilter('y')
        this.calcAxisFilter('z')
        console.log(this.filter)
        this.sampleMode = false
        this.filterActive = true
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
        }

        if(this.filterActive) {
            Object.entries(data).forEach(([key, value]) => {
                if(value > this.filter[key].top || value < this.filter[key].bottom) this.axis[key].updateAngle(value * (this.sampleRate / 1000))
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