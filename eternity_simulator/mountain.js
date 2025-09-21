let mountainSizeMult = 10;
let mountainImgWidth = 64;
let mountainDrawnSize = mountainImgWidth * mountainSizeMult;

function mountainPixelRealCoordinates(pixel) {
  return [
    pixel.x * pixel.expansionMultiplier,
    pixel.y * pixel.expansionMultiplier,
  ];
}

class MountainPixel extends ExpandedPixel {
  constructor(pixelColor, x, y, expansionMultiplier) {
    super(pixelColor, x, y, expansionMultiplier);
    this.alive = true;
  }
  draw(pg) {
    if (this.alive) {
      pg.fill(this.pixelColor);
    } else {
      pg.fill(color(0, 0, 0, 0));
    }
    pg.noStroke();
    pg.square(
      this.x * this.expansionMultiplier,
      this.y * this.expansionMultiplier,
      this.expansionMultiplier
    );
  }
}

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
    mountainImgPixelGrid[pixelX][pixelY] = new MountainPixel(
      pixelColor,
      pixelX,
      pixelY,
      mountainSizeMult
    );
  }
}

function pixelHasColor(pix) {
  return pix.pixelColor.levels[3] > 0;
}

function getTopmostPixels(pixelGrid) {
  let topmostPixels = new Array(pixelGrid.length);
  for (let i = 0; i < pixelGrid.length; ++i) {
    //find the topmost pixel in each column
    for (let j = 0; j < pixelGrid[i].length; ++j) {
      //disregard empty pixels and dead pixels
      if (!pixelHasColor(pixelGrid[i][j]) || !pixelGrid[i][j].alive) {
        continue;
      }
      //the first colored alive pixel we hit is the top
      topmostPixels[i] = pixelGrid[i][j];
      break;
    }
  }
  //filter out undefined ones
  //I know there's definitely a cleaner way to do this but javascript array manipulation feels hard to me currently
  let filteredTopmost = [];
  for (let i = 0; i < topmostPixels.length; ++i) {
    if (topmostPixels[i]) {
      filteredTopmost.push(topmostPixels[i]);
    }
  }
  return filteredTopmost;
}

function comparePixelHeight(a, b) {
  if (a.y < b.y) return -1;
  if (a.y > b.y) return 1;
  return 0;
}

const killRange = 10;
let killQueue = [];

function coloredPixelCount(pixelGrid) {
  let coloredPixelCount = 0;
  for (let i = 0; i < pixelGrid.length; ++i) {
    //find the topmost pixel in each column
    for (let j = 0; j < pixelGrid[i].length; ++j) {
      //disregard empty pixels and dead pixels
      if (pixelHasColor(pixelGrid[i][j])) {
        ++coloredPixelCount;
      }
    }
  }
  return coloredPixelCount;
}

function queueDeadPixels() {
  let tempPixelGrid = structuredClone(mountainImgPixelGrid);

  while (true) {
    //find the top pixel in each column
    let topmostPixels = getTopmostPixels(tempPixelGrid);
    if (topmostPixels.length == 0) {
      return;
    }

    //sort the pixels by Y value
    topmostPixels.sort(comparePixelHeight);

    //consider the highest N of those pixels
    let topmostPixelToKillIdx = getRandomInt(
      0,
      min(killRange, topmostPixels.length - 1)
    );
    
    if (killQueue.length == 0) {
      topmostPixelToKillIdx = 0; //always kill the same first pixel
    }


    let pixelToKill = topmostPixels[topmostPixelToKillIdx];

    //push it into the queue
    killQueue.push(pixelToKill);

    //kill it in the temporary grid
    tempPixelGrid[pixelToKill.x][pixelToKill.y].alive = false;
  }
}

function drawMountain(pg) {
  for (let i = 0; i < mountainImgPixelGrid.length; ++i) {
    for (let j = 0; j < mountainImgPixelGrid[i].length; ++j) {
      mountainImgPixelGrid[i][j].draw(pg);
    }
  }
}

function killMountainPixel() {
  if (killQueue.length > 0) {
    let pixelToKill = killQueue.shift();
    mountainImgPixelGrid[pixelToKill.x][pixelToKill.y].alive = false;
  }
}
