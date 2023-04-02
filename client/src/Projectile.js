class Projectile {
    constructor(position, angle, velocity) {
        this.position = { x: position.x, y: position.y };
        this.angle = angle;
        this.vx = velocity * Math.cos(this.angle * Math.PI / 180);
        this.vy = velocity * Math.sin(this.angle * Math.PI / 180);
        this.time = 0;
    }

    update (dt, wind) {
        const g = 10; // acceleration due to gravity in m/s^2
        const rho = 1; // air density in kg/m^3
        const Cd = 0.47; // drag coefficient for a sphere
        const r = 0.05; // radius of the sphere in meters
        const m = 1; // mass of the sphere in kg

        // the velocity relative to the air
        const vx_air = this.vx -  wind.x;
        const vy_air = this.vy - wind.y;

        //console.log('after wind: ', {vx, vy});
        const v = Math.sqrt(vx_air ** 2 + vy_air ** 2);
        const Fd = 0.5 * Cd * rho * v ** 2 * Math.PI * r ** 2;
        const Fdx = -Fd * vx_air / v;
        const Fdy = -Fd * vy_air / v;

// calculate acceleration based on wind resistance and gravity

        const ax = Fdx / m;
        const ay = (Fdy - m * g) / m;

        const dx = this.vx * dt +  1 /2 * ax * dt ** 2;
        const dy = this.vy * dt +  1 /2 * ay * dt ** 2;
        this.position = { x: this.position.x + dx, y: this.position.y + dy };
        this.time += dt;
        this.vx += ax * dt;
        this.vy += ay * dt;
    }


    isOnField(fieldWidth, fieldHeight, groundHeight) {
        return this.position.x >= 0 && this.position.x <= fieldWidth &&
            this.position.y >= 0 && this.position.y <= fieldHeight &&
            this.position.y > groundHeight;
    }

    checkForHit(opponentPosition) {
        const distance = Math.abs(opponentPosition.x - this.position.x);
        return distance <= 3;
    }
}

export default Projectile;
