


/**
 * Welcome to migration station! Keep an eye out for birds.
 * Double-click to switch to the other poster. 
 */

import './boids.js';
import './base.js';
import './spiders.js';
import './birds.js';


let migrationStationPoster;
let spiderPoster;


//not what I want but good enough 
class Fish extends Scuttler {
  constructor(origin, target) {
    super(origin.x, origin.y);
    this.target = target;
    this.maxSpeed = 3;
    this.maxForce = 0.1;
    this.height = getRandomInt(40, 60);
    this.width = getRandomInt(20, 40);
  }
  draw() {
    push();
    rect(this.position.x, this.position.y, this.width, this.height);
    pop();
  }

  dodgeMouse() {
    const mouseDodgeRadius = 100;
    let dodge;
    let mousePosition = createVector(mouseX, mouseY);
    if (p5.Vector.dist(this.position, mousePosition) < mouseDodgeRadius) {
      if (this.position.x < mouseX) {
        // go left
        dodge = createVector(-1, 0);
      } else {
        // go right
        dodge = createVector(1, 0);
      }

      dodge.mult(this.maxSpeed);
      return dodge;
    }
    return null;
  }

  scuttle(otherFish) {
    let desired = p5.Vector.sub(this.target, this.position); //make a vector that points from the position to the target
    desired.setMag(this.maxSpeed);

    let steer = p5.Vector.sub(desired, this.velocity); //per Reynolds's steering force formula
    steer.limit(this.maxForce);

    this.applyForce(steer);

    let separation = separate(this, otherFish);
    let alignment = align(this, otherFish);
    let cohesion = cohere(this, otherFish);

    // Arbitrarily weight these forces
    separation.mult(5.5);
    alignment.mult(1.0);
    cohesion.mult(0.5);

    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);

    // Dodge the mouse
    let dodging = this.dodgeMouse(this);
    if (dodging != null) {
      dodging.setMag(100);
      this.applyForce(dodging);
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    this.position.add(this.velocity);

    this.draw();
    this.acceleration.mult(0);
  }
  alive() {
    return this.position.y < this.target.y;
  }
}

class FishSpawner extends Spawner {
  constructor() {
    super(0.2);
    this.spawnCountRange = [1, 2];
  }

  chooseOriginAndTarget() {
    let originX = getRandomInt(10, width - 10);
    return [createVector(originX, -60), createVector(originX, height)];
  }

  reset() { } //override the base reset- do nothing

  run() {

    //spawn some new scuttlers
    if (this.shouldSpawn()) {
      const spawnCount = getRandomInt(this.spawnCountRange[0], this.spawnCountRange[1]);
      for (let i = 0; i < spawnCount; ++i) {
        let originAndTarget = this.chooseOriginAndTarget();
        this.scuttlers.push(new Fish(originAndTarget[0], originAndTarget[1]));
      }
    }

    //advance all scuttlers
    let deadScuttlers = [];
    this.scuttlers.map((scuttler, idx) => {
      scuttler.scuttle(this.scuttlers);
      if (!scuttler.alive()) {
        deadScuttlers.push(idx);
      }
    });

    //cull scuttlers
    this.scuttlers = this.scuttlers.filter((_, idx) => !deadScuttlers.includes(idx));

  }
}


let posterBackground;
let spawner;

let posterIdx = 0;
let posterConfigs = [];



function preload() {
  birdUp = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_up.png');
  birdDown = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_down.png');
  spiderA = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_one.png');
  spiderB = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_two.png');
  migrationStationPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station.png');
  spiderPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/spiders.png');


}

function setup() {
  createCanvas(600, 800);
  // spawner = new BirdSpawner();
  posterConfigs = [
    new Poster(new SpiderSpawner(), spiderPoster),
    new Poster(new BirdSpawner(), migrationStationPoster)
  ];

  spawner = new FishSpawner();
  posterBackground = migrationStationPoster;
}

function draw() {
  background(200);
  // posterBackground.resize(600, 800);
  // image(posterBackground, 0, 0);
  spawner.run();
}

function doubleClicked() {
  ++posterIdx;
  if (posterIdx == posterConfigs.length) {
    posterIdx = 0;
  }

  posterBackground = posterConfigs[posterIdx].bgImg;
  spawner = posterConfigs[posterIdx].spawner;
  spawner.reset();
}

/**
 * Visit!
 * Chromatic Fishery
 * 
 * - copy everything from that one p5js example
 * - fish are moving diagonal from bottom up
 * - 
 */