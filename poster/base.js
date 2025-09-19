
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Poster {
    constructor(spawner, bgImg, overlay) {
        this.bgImg = bgImg;
        this.spawner = spawner;
        this.overlay = overlay;
    }
}

class Scuttler {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.target = createVector(200, 200);

        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);

    }
    applyForce(force) {
        this.acceleration.add(force);
    }
}

class Spawner {
    constructor(spawnOdds) {
        this.spawnOdds = spawnOdds; //0-1, 0 is never and 1 is always
        this.scuttlers = [];
    }
    shouldSpawn() {
        return Math.random() < this.spawnOdds;
    }
    reset() {
        this.scuttlers = [];
    }
}

