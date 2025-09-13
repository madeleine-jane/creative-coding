
let birdUp;
let birdDown;

//i have reached a tenuously successful bird simulation
//i will not touch any more variables
class Bird extends Scuttler {
    constructor(origin, target) {
        super(origin.x, origin.y);
        this.startingPos = origin;
        this.target = target;
        this.gravity = createVector(0, 0.06);

        this.launchVerticality = getRandomInt(100, 400);
        this.launchSpeed = getRandomFloat(7, 10);

        this.maxSteerUpFrames = 15;
        this.maxForce = 0.3;

        this.framesToSteerUp = 0;

        this.size = getRandomInt(10, 20);
        this.launch();
    }
    launch() {
        this.launchVector = p5.Vector.sub(this.target, this.startingPos);
        this.launchVector.add(createVector(0, -1 * this.launchVerticality));
        this.launchVector.setMag(this.launchSpeed);
        this.velocity = this.launchVector;
    }


    draw() {
        push();

        translate(this.position.x, this.position.y);

        if (this.framesToSteerUp > 0) {
            angleMode(DEGREES);
            rotate(-10);
            image(birdDown, 0, 0, this.size, this.size);
        } else {
            image(birdUp, 0, 0, this.size, this.size);
        }
        pop();
    }
    scuttle() {
        if (this.position.y > this.startingPos.y && this.framesToSteerUp == 0) {
            this.framesToSteerUp = this.maxSteerUpFrames;
        }

        this.applyForce(this.gravity);

        if (this.framesToSteerUp > 0) {
            --this.framesToSteerUp;
            let verticalVector = createVector(0, -100 * this.launchVerticality);
            verticalVector.setMag(this.maxForce);
            this.applyForce(verticalVector);
        }

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.draw();

        this.acceleration.mult(0);
    }
    alive() {
        return this.position.x < this.target.x;
    }
}


class BirdSpawner extends Spawner {
    constructor() {
        super(0.01);
        this.minY = height * 0.3;
        this.maxY = height * 0.5;
        this.spawnCountRange = [1, 2];

    }
    chooseOriginAndTarget() {
        let originY = getRandomInt(this.minY, this.maxY);
        let targetY = getRandomInt(originY - 200, originY + 400);
        //start the bird before the canvas so it has some time to get going
        let originX = getRandomInt(-200, -100);
        return [createVector(originX, originY), createVector(width, targetY)];
    }

    run() {
        //increase odds at the start so the user doesn't have to wait too long for birds
        if (frameCount < 10) {
            this.spawnOdds = 0.1;
        } else {
            this.spawnOdds = 0.01;
        }

        //spawn some new scuttlers
        if (this.shouldSpawn()) {
            const spawnCount = getRandomInt(this.spawnCountRange[0], this.spawnCountRange[1]);
            for (let i = 0; i < spawnCount; ++i) {
                let originAndTarget = this.chooseOriginAndTarget();
                this.scuttlers.push(new Bird(originAndTarget[0], originAndTarget[1]));
            }
        }

        //advance all scuttlers
        let deadScuttlers = [];
        this.scuttlers.map((scuttler, idx) => {
            scuttler.scuttle();
            if (!scuttler.alive()) {
                deadScuttlers.push(idx);
            }
        });

        //cull scuttlers
        this.scuttlers = this.scuttlers.filter((_, idx) => !deadScuttlers.includes(idx));

    }
}