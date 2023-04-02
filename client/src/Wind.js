class Wind {
    constructor(mag, dir) {
        const magnitude = mag ? mag : (Math.random() * 25) + 5;
        this.direction = dir ? dir : (Math.random() < 0.5 ? -1 : 1);
        this.x = magnitude * this.direction;
        this.y = 0;
    }
}

export default Wind;