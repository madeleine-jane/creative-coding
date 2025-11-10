let img;
let currentStateIndex = 0;
let pixelatedImages = []

let state = [];

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


function preload() {
  img = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/squiggle_cube/assets/art_squig.png', () => {
    pixelatedImages.push({ pixelSize: 1, img: img }); // Original image
    let pixelSteps = [10, 30, 50, 100];
    for (let size of pixelSteps) {
      pixelatedImages.push({ pixelSize: size, img: pixelateImage(img, size) });
    }
  });
}

function setup() {
  createCanvas(400, 400);
}

let goingUp = true;
function nextStateIndex() {
  if (goingUp) {
    if (currentStateIndex < states.length - 1) {
      return currentStateIndex + 1;
    } else {
      goingUp = false;
      return currentStateIndex - 1;
    }
  } else {
    if (currentStateIndex > 0) {
      return currentStateIndex - 1;
    } else {
      goingUp = true;
      return currentStateIndex + 1;
    }
  }
}



function draw() {

  if (pixelatedImages.length == 0) {
    return;
  }
  image(pixelatedImages[2]);
}