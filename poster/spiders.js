
let spiderA;
let spiderB;
//spawns at the perimeter and follows the mouse
class Spider extends Scuttler {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = getRandomFloat(3, 5);
        this.maxForce = 0.1;

        this.useSpiderA = true;

        this.size = getRandomInt(30, 40);
        this.resetSwitchCountdown();
    }

    resetSwitchCountdown() {
        this.switchCountdown = 5;
    }

    draw() {
        --this.switchCountdown;
        if (this.switchCountdown == 0) {
            this.resetSwitchCountdown();
            this.useSpiderA = !this.useSpiderA;
        }
        push();
        translate(this.position.x, this.position.y);
        imageMode(CENTER);
        if (this.useSpiderA) {
            image(spiderA, 0, 0, this.size, this.size);
        } else {
            image(spiderB, 0, 0, this.size, this.size);
        }
        pop();
    }
    scuttle() {
        this.target = createVector(mouseX, mouseY); //spiders follow the mouse
        let desired = p5.Vector.sub(this.target, this.position); //make a vector that points from the position to the target

        desired.setMag(this.maxSpeed);

        let steer = p5.Vector.sub(desired, this.velocity); //per Reynolds's steering force formula
        steer.limit(this.maxForce);

        this.applyForce(steer);

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);

        this.position.add(this.velocity);

        this.draw();
        this.acceleration.mult(0);
    }
}


class SpiderSpawner extends Spawner {
    constructor() {
        super(0.1);
        this.spawnCountRange = [1, 5];
        this.scuttlers = [];
    }

    chooseSpawnPoint() {
        //spawn a bit outside the perimeter
        switch (getRandomInt(0, 3)) {
            case 0: //left
                return createVector(-50, getRandomInt(0, height));
            case 1: //right
                return createVector(width + 50, getRandomInt(0, height));
            case 2: //top
                return createVector(getRandomInt(0, width), -50);
            case 3: //bottom
                return createVector(getRandomInt(0, width), height + 50);
        }
    }

    run() {
        if (this.shouldSpawn()) {
            const spawnCount = getRandomInt(this.spawnCountRange[0], this.spawnCountRange[1]);
            for (let i = 0; i < spawnCount; ++i) {
                let spawnPoint = this.chooseSpawnPoint();
                this.scuttlers.push(new Spider(spawnPoint.x, spawnPoint.y));
            }
        }

        this.scuttlers.map((scuttler) => {
            scuttler.scuttle();
        });
    }
}