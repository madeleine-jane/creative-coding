


/**
 * Welcome to migration station! Keep an eye out for birds.
 * Double-click to look through the other posters. 
 */

import './boids.js';
import './base.js';
import './spiders.js';
import './birds.js';


let migrationStationPoster;
let spiderPoster;
let fisheryPoster;
let baseFish;


function mouseInCanvas() {
  return mouseX > 0 && mouseX < width &&
    mouseY > 0 && mouseY < height;
}

let fishLines = [];
let fishBases = [];

const numColors = 13;

function loadFishImages() {
  for (let i = 0; i < numColors; ++i) {
    let base = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/fish/bases/fish_' + i + '.png');
    let line = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/fish/lines/fish_' + i + '.png');

    fishBases.push(base);
    fishLines.push(line);
  }
  console.log('loading complete!');
}


class Fish extends Scuttler {
  constructor(origin, target) {
    super(origin.x, origin.y);
    this.target = target;
    this.maxSpeed = 3;
    this.maxForce = 0.1;
    this.height = getRandomInt(40, 120);
    this.width = getRandomInt(this.height - 20, this.height + 5);
    this.setColors();
  }
  setColors() {
    let baseColorIdx = getRandomInt(0, fishBases.length - 1);
    let lineColorIdx = getRandomInt(0, fishLines.length - 1);
    if (baseColorIdx == lineColorIdx) {
      ++lineColorIdx;
    }
    if (lineColorIdx == fishLines.length) {
      lineColorIdx = 0;
    }
    this.baseImg = fishBases[baseColorIdx];
    this.lineImg = fishLines[lineColorIdx];
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);
    imageMode(CENTER);
    image(this.baseImg, 0, 0, this.width, this.height);
    image(this.lineImg, 0, 0, this.width, this.height);
    pop();
  }



  scuttle(otherFish) {
    let desired = p5.Vector.sub(this.target, this.position); //make a vector that points from the position to the target
    desired.setMag(this.maxSpeed);

    let steer = p5.Vector.sub(desired, this.velocity); //per Reynolds's steering force formula
    steer.limit(this.maxForce);

    this.applyForce(steer);

    let separation = separate(this, otherFish);
    separation.mult(3);

    this.applyForce(separation);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    this.position.add(this.velocity);

    this.draw();
    this.acceleration.mult(0);
  }
  alive() {
    return this.position.y < (this.target.y + 10);
  }
}

class FishSpawner extends Spawner {
  constructor() {
    super(0.12);
    this.spawnCountRange = [2, 4];
  }


  chooseOriginAndTarget() {
    let originX = getRandomInt(0, width);
    return [createVector(originX, -100), createVector(originX, height)];
  }

  reset() { }
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


let posterIdx = 0;
let posters = [];

let migrationStationOverlay;
let fisheryOverlay;

function preload() {
  birdUp = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_up.png');
  birdDown = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_down.png');
  spiderA = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_one.png');
  spiderB = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_two.png');
  migrationStationPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station.png');
  spiderPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/spiders_v2.png');
  fisheryPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/chromatic_fishery.png');
  migrationStationOverlay = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station_overlay.png');
  fisheryOverlay = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/chromatic_fishery_overlay.png');

  loadFishImages();
}


function setup() {
  createCanvas(600, 800);
  posters = [
    new Poster(new BirdSpawner(), migrationStationPoster, migrationStationOverlay),
    new Poster(new FishSpawner(), fisheryPoster, fisheryOverlay),
    new Poster(new SpiderSpawner(), spiderPoster),
  ];
}


function draw() {
  let poster = posters[posterIdx];
  poster.bgImg.resize(600, 800);
  image(poster.bgImg, 0, 0);
  poster.spawner.run();
  if (poster.overlay) {
    poster.overlay.resize(600, 800);
    image(poster.overlay, 0, 0);
  }
}

function doubleClicked() {
  ++posterIdx;
  if (posterIdx == posters.length) {
    posterIdx = 0;
  }
  posters[posterIdx].spawner.reset();
}

