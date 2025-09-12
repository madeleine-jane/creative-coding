


/**
 * Welcome to migration station! 𓆩(•࿉•)𓆪
 * Double-click to change poster. 
 */














let spiderA;
let spiderB;
let birdUp;
let birdDown;

let migrationStationPoster;
let spiderPoster;

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


//spawns at the perimeter and follows the mouse
class Spider extends Scuttler {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 3;
    this.maxForce = 0.1;

    this.switchCountdown = 10;
    this.useSpiderA = true;
  }

  resetSwitchCountdown() {
    this.switchCountdown = 10;
  }
  draw() {
    --this.switchCountdown;
    if (this.switchCountdown == 0) {
      this.resetSwitchCountdown();
      this.useSpiderA = !this.useSpiderA;
    }
    push();
    translate(this.position.x, this.position.y);
    if (this.useSpiderA) {
      image(spiderA, 0, 0, 40, 40);
    } else {
      image(spiderB, 0, 0, 40, 40);
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

    this.size = getRandomInt(25, 35);
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
    super(0.01); //0.1
    this.minY = height * 0.2;
    this.maxY = height * 0.4;
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


let poster;
let spawner;

let showingSpiders = false;

function preload() {
  birdUp = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/bird_up.png');
  birdDown = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/bird_down.png');
  spiderA = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_a.png');
  spiderB = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_b.png');
  migrationStationPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station.png');
  spiderPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/spiders.png');
}

function setup() {
  createCanvas(600, 800);
  spawner = new BirdSpawner();
  poster = migrationStationPoster;
}

function draw() {
  background(200);
  poster.resize(600, 800);
  image(poster, 0, 0);
  spawner.run();
}

function doubleClicked() {
  if (showingSpiders) {
    spawner = new BirdSpawner();
    poster = migrationStationPoster;
  } else {
    spawner = new SpiderSpawner();
    poster = spiderPoster;
  }
  showingSpiders = !showingSpiders;
}

