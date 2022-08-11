class Axis {
    constructor(name){
        this.angle = 0;
        this.name = name;
    }
    
    updateValue( value ) {
        //TODO:
        //limit angle after full circle return to initial pos
        this.angle += value;
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
        this.filter = {};
        this.mean = {};
        this.standardDeviation = {};
        this.iteration = 0;
        // this.popSize = 200;
        // this.diviationMultiplier = 2;
        this.diviationMultiplier = 2;
        this.sampleRate = 1;
        this.rawData = ''
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
                diviationMultiplier: this.diviationMultiplier,
                sampleRate: this.sampleRate,
                sampleMode: this.sampleMode,
                dataStream: this.rawData,
                iteration: this.iteration
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
                diviationMultiplier: this.diviationMultiplier,
                sampleRate: this.sampleRate,
                sampleMode: this.sampleMode,
                dataStream: this.rawData
            }
        }
    }

    calcFilter () {
        this.calcAxisFilter('x')
        this.calcAxisFilter('y')
        this.calcAxisFilter('z')
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
                if(value > this.filter[key].top || value < this.filter[key].bottom) this.axis[key].updateValue(value * this.sampleRate)
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