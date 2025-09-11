
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



class Scuttler {
  constructor(x, y) {
    this.maxSpeed = 3;
    this.maxForce = 0.1;

    this.position = createVector(x, y);
    this.target = createVector(200, 200);

    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

  }
  applyForce(force) {
    this.acceleration.add(force);
  }

}

class Spider extends Scuttler {
  constructor(x, y) {
    super(x, y);
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


class Spawner {
  constructor(spawnOdds) {
    this.spawnOdds = spawnOdds; //0-1, 0 is never and 1 is always

  }
  shouldSpawn() {
    return Math.random() < this.spawnOdds;
  }
}

class SpiderSpawner extends Spawner {
  constructor() {
    super(0.1);
    this.spawnCountRange = [1, 5];
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
    if (!this.shouldSpawn()) {
      return;
    }
    const spawnCount = getRandomInt(this.spawnCountRange[0], this.spawnCountRange[1]);
    for (let i = 0; i < spawnCount; ++i) {
      let spawnPoint = this.chooseSpawnPoint();
      scuttlers.push(new Spider(spawnPoint.x, spawnPoint.y));
    }
  }
}

/**

 * Spider: 
 * - slow down and then stop at a random point within a certain radius
 * 
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

let scuttlers = [];


let spawner = new SpiderSpawner();

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  spawner.run();
  scuttlers.map((scuttler) => {
    scuttler.scuttle();
  });
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