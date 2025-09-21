let currentColorTop;
let currentColorBottom;

let sunriseColorTop;
let sunriseColorBottom;

let afternoonColorTop;
let afternoonColorBottom;

let nightColorTop;
let nightColorBottom;

let backgroundPixels;

class BackgroundPixel extends ExpandedPixel {
  constructor(pixelColor, x, y, expansionMultiplier, colorModifier) {
    super(pixelColor, x, y, expansionMultiplier);
    this.colorModifier = colorModifier;
  }
  draw(pg) {
    let drawColor = color(
      red(this.pixelColor) + this.colorModifier,
      green(this.pixelColor) + this.colorModifier,
      blue(this.pixelColor) + this.colorModifier
    );
    pg.fill(drawColor);
    pg.noStroke();
    pg.square(this.x, this.y, this.expansionMultiplier);
  }
}

function incrementColor(inter, starting, target) {
  currentColorTop = lerpColor(startingBottomColor, targetBottomColor, inter);
  currentColorBottom = lerpColor(startingTopColor, targetTopColor, inter);
}

function setGradient(pg, c1, c2) {
  // noprotect
  pg.noFill();
  for (var y = 0; y < height; y++) {
    var inter = map(y, 0, height, 0, 1);
    var c = lerpColor(c1, c2, inter);
    pg.stroke(c);
    pg.line(0, y, width, y);
  }
}

let pixelTotal;


function initializeBackgroundGradient(pg, mountainPixelCount, pixelSize) {
  pixelTotal = mountainPixelCount;

  pg.loadPixels();
  for (let i = 0; i < pg.width; i += pixelSize) {
    for (let j = 0; j < pg.height; j += pixelSize) {
      let pixelIdx = coordinatesToPixelIdx(i, j, pg.width);
      let pixelColor = color(
        pg.pixels[pixelIdx],
        pg.pixels[pixelIdx + 1],
        pg.pixels[pixelIdx + 2],
        pg.pixels[pixelIdx + 3]
      );
      let colorModifier = getRandomInt(-4, 4) //just add a little noise so the background pixels are more noticeable
      backgroundPixels[i / pixelSize][j / pixelSize] = new BackgroundPixel(
        pixelColor,
        i,
        j,
        pixelSize,
        colorModifier
      );
    }
  }
}

function drawGradient(pg, mountainPixelsRemaining) {
  if (!pixelTotal) {
    return;
  }
  let targetColorTop;
  let targetColorBottom;

  let startingColorTop;
  let startingColorBottom;

  //for my sanity let's count up instead of down
  const mountainPixelsKilled = pixelTotal - mountainPixelsRemaining;
  let pixelTargetCount;
  let pixelStartCount;

  //there's definitely a cleaner way to do this but its currently 1am and i have no brain cells
  if (mountainPixelsKilled < pixelTotal / 2) {
    pixelStartCount = 0;
    pixelTargetCount = pixelTotal / 2;
    startingColorTop = sunriseColorTop;
    startingColorBottom = sunriseColorBottom;

    targetColorTop = afternoonColorTop;
    targetColorBottom = afternoonColorBottom;
  } else {
    pixelStartCount = pixelTotal / 2;
    pixelTargetCount = pixelTotal;
    startingColorTop = afternoonColorTop;
    startingColorBottom = afternoonColorBottom;

    targetColorTop = nightColorTop;
    targetColorBottom = nightColorBottom;
  }

  let inter = map(
    mountainPixelsKilled,
    pixelStartCount,
    pixelTargetCount,
    0,
    1,
    true
  );
  
  //go towards the target color more quickly and then ease in
  let skewed = sqrt(inter); 

  currentBottomColor = lerpColor(startingColorBottom, targetColorBottom, skewed);
  currentTopColor = lerpColor(startingColorTop, targetColorTop, skewed);
  setGradient(pg, currentTopColor, currentBottomColor);
}

//sample the canvas every N pixels and draw that color to a square to make the sky look pixelated
//this is busted in some undefinable way where it only works if pixelSize is 10
function drawBackground(pg, pixelSize, mountainPixelsRemaining) {
  drawGradient(pg, mountainPixelsRemaining);
  pg.loadPixels();

  for (let i = 0; i < pg.width; i += pixelSize) {
    for (let j = 0; j < pg.height; j += pixelSize) {
      let pixelIdx = coordinatesToPixelIdx(i, j, pg.width) * 4;
      let pixelColor = color(
        pg.pixels[pixelIdx],
        pg.pixels[pixelIdx + 1],
        pg.pixels[pixelIdx + 2],
        pg.pixels[pixelIdx + 3]
      );

      backgroundPixels[i / pixelSize][j / pixelSize].pixelColor = pixelColor;
      backgroundPixels[i / pixelSize][j / pixelSize].draw(pg);
    }
  }

}
