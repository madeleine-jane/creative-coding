
let spawner;

let spiderA;
let spiderB;
let birdUp;
let birdDown;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
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
}


class SpiderSpawner extends Spawner {
  constructor() {
    super(0.1);
    this.spawnCountRange = [1, 5];
    this.scuttlers = [];
  }

  chooseSpawnPoint() {
    switch (getRandomInt(0, 3)) {
      case 0: //left
        return createVector(0, getRandomInt(0, height));
      case 1: //right
        return createVector(width, getRandomInt(0, height));
      case 2: //top
        return createVector(getRandomInt(0, width), 0);
      case 3: //bottom
        return createVector(getRandomInt(0, width), height);
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


//spawns at the perimeter and follows the mouse
class Spider extends Scuttler {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 3;
    this.maxForce = 0.1;
  }
  draw() {
    circle(this.position.x, this.position.y, 10);
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

//i have reached a tenuously successful bird simulation
//i will not touch any more variables
class Bird extends Scuttler {
  constructor(origin, target) {
    super(origin.x, origin.y);
    this.startingPos = origin;
    this.target = target;
    this.gravity = createVector(0, 0.06);

    this.launchVerticality = getRandomInt(100, 400);
    this.launchSpeed = getRandomFloat(6, 8);

    this.maxSteerUpFrames = 30;
    this.maxForce = 0.2;

    this.framesToSteerUp = 0;
    this.launch();
  }
  launch() {
    this.launchVector = p5.Vector.sub(this.target, this.startingPos);
    this.launchVector.add(createVector(0, -1 * this.launchVerticality));
    this.launchVector.setMag(this.launchSpeed);
    this.velocity = this.launchVector;
  }

  draw() {
    if (this.framesToSteerUp > 0) { //todo tilt to follow the velocity direction
      image(birdDown, this.position.x, this.position.y, 25, 25);
    } else {
      image(birdUp, this.position.x, this.position.y, 25, 25);
    }
    // square(this.position.x, this.position.y, 10);
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
    super(0.05); //0.1
    this.minY = height * 0.2;
    this.maxY = height * 0.6;
    this.spawnCountRange = [1, 2];

  }
  chooseOriginAndTarget() {
    let originY = getRandomInt(this.minY, this.maxY);
    let targetY = getRandomInt(originY - 400, originY + 400);
    //start the bird before the canvas so it has some time to get going
    let originX = getRandomInt(-200, -100);
    return [createVector(originX, originY), createVector(width, targetY)];
  }

  run() {
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




function preload() {
  spiderA = loadImage('assets/spider_a.png');
  // spiderB = loadImage('/assets/spider_b.png');
  // birdUp = loadImage('/assets/bird_up.png');
  // birdDown = loadImage('/assets/bird_down.png');
}

function setup() {
  createCanvas(600, 900);
  spawner = new BirdSpawner();

}

function draw() {
  background(220);
  spawner.run();
}

/**
 * 
 *  
 * 
 */



/**
 * class Particle
 * - position: vector
 * - velocity: vector
 * - acceleration: vector 
 * - draw(): displays image
 *
 * Notes:
 * - Object has goal, or set of goals that it chooses from
 *    - seek a target
 *    - follow a path
 *    - avoid an obstacle
 * - Then steer:
 *   steering force = desired velocity – current velocity 
 *   steering vector = desired velocity - current velocity, at max possible speed (desired.setMag(this.maxspeed))
 *   then apply the force of that vector to the current vector with:
 *      - applyForce(force vector): f=ma, a=f/m, where mass is a const
 *   then have a maximum steering force (the handling, how fast it can turn)
 */


/**

 * Spider: 
 * - draw spider asset with two frames of movement
 * - design background ("oh god, spiders" in pop vintage font with drop shadow/underlines), draw in paintey style in procreate to match other backgrounds)
 * - mooligat font (find out how to do outline and drop shadow as shown)
 * 
 * Bird:
 * - spawn on the right side of the screen. 
 * - initialize with an up and leftwards velocity at some angle
 * - apply drag and gravity forces
 * - if position gets too low, flap (add upwards acceleration)
 * - mess around with flapping: maybe a lot of little regular flaps?
 * 
 * Fish: 
 * - have some awareness of each other- cohesion, not overlapping (see example)
 * - start on one side of the screen and move towards the other
 * - dodge the mouse
 */
