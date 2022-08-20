class Axis {
    constructor(sampleRate, diviationMultiplier){
        //get sample rate time from super class
        this.prevAngularRate = 0;
        this.angle = 0;
        // this.name = name;
        this.sampleRateRef = sampleRate
        this.deviationRef = diviationMultiplier
    }
    
    updateAngle( incomingAngleRate ) {
        //TODO:
        //limit angle after full circle return to initial pos

        const time = this.sampleRateRef.value;
    
        // GETTING DEVIATION FROM PARENT, NOT SURE

        // const DEVIATION = this.deviationRef.value
        const DEVIATION = 0 


        // this.angle = this.angle + ((time * (incomingAngleRate - this.prevAngularRate + DEVIATION))/( 2 * 131))
        this.angle += incomingAngleRate
        // this.prevAngularRate = incomingAngleRate
    }   

    getState() {
        return {
            name: this.name,
            angle: this.angle,
            sampleRateRef: this.sampleRateRef,
            deviationRef: this.deviationRef
        }
    }
}

class Gauge {
    constructor () {
        // CHANGE X Y Z TO ARRAY AND ASSUME AXIS 
        this.diviationMultiplier = { value: 2 }
        this.sampleRate = { value: null, unit: undefined };
        
        this.axis = {
            "x": new Axis(this.sampleRate, this.diviationMultiplier),
            "y": new Axis(this.sampleRate, this.diviationMultiplier),
            "z": new Axis(this.sampleRate, this.diviationMultiplier)
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

        this.mean = {};
        this.standardDeviation = {};
        this.filterIteration = 0;
        // this.popSize = 200;
        

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
        this.filterIteration = 0;
    }

    parseDataStream (string) {
        this.rawData = string
        if(string[0] === '$') {
            this.calcFilter()
            return
        }
        const gData = string.split(' ')

        // slowing down??
        this.sampleRate.value = parseFloat(gData[3])
        this.sampleRate.unit = gData[4]

        this.updateValue({
            x: parseFloat(gData[0]),
            y: parseFloat(gData[1]),
            z: parseFloat(gData[2])
        })
    }

    
    calcFilter () {
        this.calcAxisFilter('x')
        this.calcAxisFilter('y')
        this.calcAxisFilter('z')
        this.sampleMode = false
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
        this.filter[axis].top = this.mean[axis] + stdDiv * this.diviationMultiplier.value
        this.filter[axis].bottom = this.mean[axis] - stdDiv * this.diviationMultiplier.value
    }

    updateValue( data ) {
        if(this.sampleMode) {
            this.filterIteration ++
            this.sampleRepo.x.push(data.x)
            this.sampleRepo.y.push(data.y)
            this.sampleRepo.z.push(data.z)
            return
        }
        Object.entries(data).forEach(([key, value]) => {

            if(
                value > this.filter[key].top || 
                value < this.filter[key].bottom 
            ) 
            this.axis[key].updateAngle(value)
        })
        
    }
    
    getAngles() {
        return {
            x: this.axis.x.angle,
            y: this.axis.y.angle,
            z: this.axis.z.angle
        }
    }
    
    getAxisData () {
        return {
            x: this.axis.x.getState(),
            y: this.axis.y.getState(),
            z: this.axis.z.getState()
        }
    }

    getStateData() {
        if(this.sampleMode){
            return {
                values: {
                    diviationMultiplier: this.diviationMultiplier,
                    sampleRate: this.sampleRate,
                    sampleMode: this.sampleMode,
                    filterIteration: this.filterIteration,
                },
                dataStream: {stream: this.rawData},
            }
        } else {
            return {
                values: {
                    diviationMultiplier: this.diviationMultiplier,
                    sampleRate: this.sampleRate,
                    sampleMode: this.sampleMode,
                },
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
                sampleRepoLength: {
                    x: this.sampleRepo.x.length,
                    y: this.sampleRepo.y.length,
                    z: this.sampleRepo.z.length
                },
                dataStream: {stream: this.rawData}
            }
        }
    }

}

module.exports = Gauge;