
const staticGridSize = 70;
let staticGrid;
let staticPixelSize = 6;

const staticColorStep = 20; //up for fewer static colors, down for more
let staticValues = [];


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  let idx = getRandomInt(0, arr.length - 1);
  return arr[idx];
}

function populateStaticValues() {
  for (let i = 0; i < 255; i += min(staticColorStep, 255 - i)) {
    staticValues.push(i);
  }
}

class StaticPixel {
  constructor(grey) {
    this.grey = grey;
    this.frozen = false;
  }
}

function generateStatic() {
  for (let i = 0; i < staticGrid.length; ++i) {
    for (let j = 0; j < staticGrid[i].length; ++j) {
      if (staticGrid[i][j].frozen) {
        continue;
      }
      staticGrid[i][j] = new StaticPixel(getRandomElement(staticValues));
    }
  }
}

function findStartPixel() {
  let eligiblePixels = [];
  //choose a start point
  for (let i = 0; i < staticGrid.length; ++i) {
    for (let j = 0; j < staticGrid[i].length; ++j) {
      if (staticGrid[i][j].grey == 0) {
        eligiblePixels.push([i, j]);
      }
    }
  }
  return getRandomElement(eligiblePixels);
}

function setup() {
  staticGrid = new Array(staticGridSize)
    .fill(null)
    .map(() =>
      new Array(staticGridSize).fill(0)
    );
  populateStaticValues();

  generateStatic();
  let [startPixelX, startPixelY] = findStartPixel();
  staticGrid[startPixelX][startPixelY].frozen = true;

  createCanvas(staticGridSize * staticPixelSize, staticGridSize * staticPixelSize);
  frameRate(20);
}

function drawStatic() {
  for (let i = 0; i < staticGrid.length; ++i) {
    for (let j = 0; j < staticGrid[i].length; ++j) {
      noStroke();
      fill(color(staticGrid[i][j].grey));
      square(i * staticPixelSize, j * staticPixelSize, staticPixelSize);
    }
  }
}


function coordsInRange(x, y) {
  return x >= 0 && x < staticGridSize && y >= 0 && y < staticGridSize;
}

function frozenSurroundingPixels(x, y) {
  const coordsToExamine = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
  let surroundingPixelCount = 0;
  for (let i = 0; i < coordsToExamine.length; ++i) {
    let x = coordsToExamine[i][0];
    let y = coordsToExamine[i][1];
    if (!coordsInRange(x, y)) {
      continue;
    }
    if (staticGrid[x][y].frozen) {
      ++surroundingPixelCount;
    }
  }
  return surroundingPixelCount;
}

function pixelShouldFreeze(x, y) {
  return coordsInRange(x, y) && !staticGrid[x][y].frozen && staticGrid[x][y].grey == 0 && frozenSurroundingPixels(x, y) < 2;
}

//maybe don't allow a pixel to freeze if it's got N frozen pizels around it
function examineSurroundingPixels(x, y) {
  const coordsToExamine = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
  for (let i = 0; i < coordsToExamine.length; ++i) {
    let x = coordsToExamine[i][0];
    let y = coordsToExamine[i][1];
    if (pixelShouldFreeze(x, y)) {
      staticGrid[x][y].frozen = true;
      examineSurroundingPixels(x, y);
    }
  }
}

function freezeSurroundingPixels() {
  for (let i = 0; i < staticGrid.length; ++i) {
    for (let j = 0; j < staticGrid[i].length; ++j) {
      if (staticGrid[i][j].frozen) {
        examineSurroundingPixels(i, j);
      }
    }
  }
}

function draw() {
  background(220);
  generateStatic();
  freezeSurroundingPixels();
  drawStatic();
}
