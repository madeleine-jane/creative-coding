let img;
let currentImageIndex = 0;
let pixelatedImages = [];

let stagePixels = [];

function pixelateImage(sourceImg, pixelSize) {
  let pixelatedImg = createImage(sourceImg.width, sourceImg.height);
  sourceImg.loadPixels();
  pixelatedImg.loadPixels();

  for (let y = 0; y < sourceImg.height; y += pixelSize) {
    for (let x = 0; x < sourceImg.width; x += pixelSize) {
      let index = (x + y * sourceImg.width) * 4;
      let r = sourceImg.pixels[index];
      let g = sourceImg.pixels[index + 1];
      let b = sourceImg.pixels[index + 2];
      let a = sourceImg.pixels[index + 3];

      for (let py = 0; py < pixelSize; py++) {
        for (let px = 0; px < pixelSize; px++) {
          if (x + px < sourceImg.width && y + py < sourceImg.height) {
            let pIndex = ((x + px) + (y + py) * sourceImg.width) * 4;
            pixelatedImg.pixels[pIndex] = r;
            pixelatedImg.pixels[pIndex + 1] = g;
            pixelatedImg.pixels[pIndex + 2] = b;
            pixelatedImg.pixels[pIndex + 3] = a;
          }
        }
      }
    }
  }

  pixelatedImg.updatePixels();
  return pixelatedImg;
}



function setup() {
}

let goingUp = true;

function nextImageIndex() {

  if (goingUp) {
    if (currentImageIndex < pixelatedImages.length - 1) {
      return currentImageIndex + 1;
    } else {
      goingUp = false;
      return currentImageIndex - 1;
    }
  } else {
    if (currentImageIndex > 0) {
      return currentImageIndex - 1;
    } else {
      goingUp = true;
      return currentImageIndex + 1;
    }
  }
}

function stageComplete() {
  for (let stagePixel of stagePixels) {
    if (!stagePixel.drawn) {
      return false;
    }
  }
  return true;
}

function setNextStage() {
  console.log(currentImageIndex);
  currentImageIndex = nextImageIndex();
  console.log(currentImageIndex);
  stagePixels = [];
  let nextImage = pixelatedImages[currentImageIndex];

  // iterate by the pixel block size so each stage pixel corresponds to a block
  for (let i = 0; i < width; i += nextImage.pixelSize) {
    for (let j = 0; j < height; j += nextImage.pixelSize) {
      stagePixels.push({ x: i, y: j, drawn: false });
    }
  }
}

function getPixelIdxToDraw() {
  // Collect indices of all undrawn pixels
  let undrawnIndices = [];
  for (let i = 0; i < stagePixels.length; i++) {
    if (!stagePixels[i].drawn) {
      undrawnIndices.push(i);
    }
  }
  // If there are no undrawn pixels, return -1
  if (undrawnIndices.length === 0) {
    return -1;
  }
  // Return a random index from the undrawnIndices array
  let randIdx = floor(random(undrawnIndices.length));
  return undrawnIndices[randIdx];
}

function drawStagePixel() {
  let drawIdx = getPixelIdxToDraw();
  if (drawIdx < 0) {
    return;
  }

  stagePixels[drawIdx].drawn = true;

  let x = stagePixels[drawIdx].x;
  let y = stagePixels[drawIdx].y;
  let w = pixelatedImages[currentImageIndex].pixelSize;

  let pixelToDraw = pixelatedImages[currentImageIndex].img.get(x, y, w, w);
  image(pixelToDraw, x, y, w, w);
}












let green, pink;
let pixelSize = 20;
let pinkGrid = [];

function preload() {
  // img = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/squiggle_cube/assets/art_squig.png', () => {
  //   pixelatedImages.push({ pixelSize: 1, img: img }); // Original image
  //   let pixelSteps = [10, 30, 50, 100];
  //   for (let size of pixelSteps) {
  //     pixelatedImages.push({ pixelSize: size, img: pixelateImage(img, size) });
  //   }
  //   image(img, 0, 0, width, height);
  //   setNextStage();
  // });

  green = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/squiggle_cube/assets/green_test.png', () => {
    createCanvas(400, 554);
    image(green, 0, 0, width, height);
    for (let x = 0; x < width; x += pixelSize) {
      for (let y = 0; y < height; y += pixelSize) {
        pinkGrid.push({ x: x, y: y, drawn: false });
      }
    }
  });

  pink = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/squiggle_cube/assets/pink_test.png');
}

function choosePixelToDraw() {
  // Collect indices of all undrawn pixels
  let undrawnIndices = [];
  for (let i = 0; i < pinkGrid.length; i++) {
    if (!pinkGrid[i].drawn) {
      undrawnIndices.push(i);
    }
  }
  // If there are no undrawn pixels, return -1
  if (undrawnIndices.length === 0) {
    return null;
  }
  // Return a random index from the undrawnIndices array
  let randIdx = floor(random(undrawnIndices.length));

  pinkGrid[randIdx].drawn = true;
  return pinkGrid[randIdx];
}

function draw() {
  if (green == null || pink == null) {
    return;
  }


  for (let i = 0; i < 30; i++) {
    let pixel = choosePixelToDraw();
    if (pixel != null) {
      let pixelToDraw = pink.get(pixel.x, pixel.y, pixelSize, pixelSize);
      image(pixelToDraw, pixel.x, pixel.y, pixelSize, pixelSize);
    }
  }


  // image(pixelatedImages[4].img, 0, 0, width, height);
}