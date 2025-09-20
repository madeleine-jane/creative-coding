const startedAt = Date.now();
const lerpSecs = 10;

const lerpCompleteAt = startedAt + lerpSecs * 1000;


let mountainImg;
let mountainPg;

let mountainSizeMult;
let mountainImgWidth;
let mountainDrawnSize;

let mountainImgPixelGrid;

function pixelIdxToCoordinates(pixelIdx, imageWidth) {
  // Convert raw pixels[] index into pixel number
  const pixelNumber = Math.floor(pixelIdx / 4);
  const x = pixelNumber % imageWidth;
  const y = Math.floor(pixelNumber / imageWidth);
  return [x, y];
}

function coordinatesToPixelIdx(x, y, imageWidth) {
  // Convert pixel coordinates back into raw pixels[] index
  return (y * imageWidth + x) * 4;
}

function loadMountain(pg, mountainImg) {
  //initialize output grid so i can just index into it
  mountainImg.loadPixels();
  for (let i = 0; i < mountainImg.pixels.length; i += 4) {
    //isolate the color of the pixel
    let pixelColor = color(
      mountainImg.pixels[i],
      mountainImg.pixels[i + 1],
      mountainImg.pixels[i + 2],
      mountainImg.pixels[i + 3]
    );
    //then insert it into a 2d array
    let [pixelX, pixelY] = pixelIdxToCoordinates(i, mountainImgWidth);
    mountainImgPixelGrid[pixelX][pixelY] = pixelColor;
  }
}

function drawMountain(pg) {
  for (let i = 0; i < mountainImgPixelGrid.length; ++i) {
    for (let j = 0; j < mountainImgPixelGrid[i].length; ++j) {
      pg.fill(mountainImgPixelGrid[i][j]); // actually use the pixel’s color
      pg.noStroke();
      pg.square(i * mountainSizeMult, j * mountainSizeMult, mountainSizeMult);
    }
  }
}

function preload() {
  mountainSizeMult = 10;
  mountainImgWidth = 64;
  mountainDrawnSize = mountainImgWidth * mountainSizeMult;

  mountainImgPixelGrid = new Array(mountainImgWidth)
    .fill(null)
    .map(() => new Array(mountainImgWidth).fill(color(0)));

  mountainImg = loadImage(
    "https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/clock/assets/mountain.png"
  );
  mountainPg = createGraphics(mountainDrawnSize, mountainDrawnSize);
}

function setup() {
  frameRate(3);
  loadMountain(mountainPg, mountainImg);
  createCanvas(mountainDrawnSize, mountainDrawnSize * (4 / 3));

}

function draw() {
  background(220);
  mountainPg.background(color('green));
  drawMountain(mountainPg);
  // mountainPg.image(mountainImg, 0, 0);
  image(mountainPg, 0, height - mountainDrawnSize);
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
