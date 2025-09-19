
const startedAt = Date.now();
const lerpSecs = 10;

const lerpCompleteAt = startedAt + (lerpSecs * 1000);

const startingBottomColor = color('red');
const startingTopColor = color('blue');
const targetBottomColor = color('purple');
const targetTopColor = color('yellow');

let currentBottomColor = startingBottomColor;
let currentTopColor = startingTopColor;

let mountainImg;

function setup() {
  createCanvas(600, 800);
  mountainImg = loadImage('asset/mountain.png');
}

function draw() {
  background(220);
  image(mountainImg, 0, 0);
  // incrementColors();
  // setGradient(currentTopColor, currentBottomColor);
}

function incrementColors() {
  const currentTime = Date.now();
  let inter = map(currentTime, startedAt, lerpCompleteAt, 0, 1);
  currentBottomColor = lerpColor(startingBottomColor, targetBottomColor, inter);
  currentTopColor = lerpColor(startingTopColor, targetTopColor, inter);
}

function setGradient(c1, c2) {
  // noprotect
  noFill();
  for (var y = 0; y < height; y++) {
    var inter = map(y, 0, height, 0, 1);
    var c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function mouseClicked() {
  console.log(get(mouseX, mouseY));
}