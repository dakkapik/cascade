class Axis {
    constructor(name){
        this.angle = 0;
        this.name = name;
    }
    
    updateValue( value ) {
        //TODO:
        //limit angle after full circle return to initial pos
        this.angle = value;
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
        this.sampleMode = true;
    }

    calcAxisFilter( axis ) {
        const sampleData = this.sampleRepo[axis]

        let sumTotal = 0;
        // check if pop size and iteration are the same
        console.log("xdata length: " , sampleData.length)
        console.log("iteration: " , this.iteration)

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
            //HERE
        } else {

        }
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