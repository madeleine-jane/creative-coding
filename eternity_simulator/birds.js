
function secsSinceStart() {
  return Math.floor(millis() / 1000);
}

function resetBirdClock(interval) {
  nextBirdAtSecs = secsSinceStart() + interval;
}

function secsUntilBird() {
  return nextBirdAtSecs - secsSinceStart();
}

class Bird {
  constructor(targetPixel) {
    let [pixelX, pixelY] = mountainPixelRealCoordinates(targetPixel);

    this.currentPos = createVector(0, 125);
    this.pixelPos = createVector(pixelX, pixelY);
    this.exitPos = createVector(width, 125);

    this.maxSpeed = 10;

    this.target = this.pixelPos;
    this.alive = true;
    
  } 
  advance() {
    let desired = p5.Vector.sub(this.target, this.currentPos); //make a vector that points from the position to the target
    desired.setMag(min(this.maxSpeed, this.currentPos.dist(this.target)));

    this.currentPos = this.currentPos.add(desired);

    if (this.currentPos.dist(this.pixelPos) < 5) {
      this.target = this.exitPos;
      killMountainPixel();
    }
    if (this.currentPos.dist(this.exitPos) < 5) {
      this.alive = false;
    }
    return killMountainPixel;
  }
  draw(pg) {
    pg.fill(color(4, 69, 120));
    pg.square(this.currentPos.x, this.currentPos.y, 10);
  }
}

