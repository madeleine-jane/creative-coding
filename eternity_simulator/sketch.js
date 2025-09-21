/*
Welcome to the eternity simulator! 
Estimated duration: 1.8 million years.

Double-click for time travel. 
*/

const secsInOneThousandYears = 1000 * 365 * 24 * 60 * 60;

//Set this to 3 to watch the birds come more frequently.
let birdIntervalSecs = secsInOneThousandYears;

//********//********//********//********//********//********//
























/*
About:

This project mostly involved mapping individual pixels to 10x10 squares of color on the canvas, which turned out to be much more complicated than I had anticipated.  

The sketch has three main elements:

1. Drawing the mountain:

I drew the mountain image using a pixel drawing app. Then I loaded the 64x64 image into the sketch and blew each pixel up to a 10x10 square.

The pixel -> color square mapping on the mountain involved indexing into three arrays simultaneously:
- The pixels in the original mountain image: a 1D array with an index for each color channel of each pixel
- A 2D 64x64 array to represent where each pixel is in the original image
- The larger canvas grid that gets pixels mapped onto it(640x640) 

It got very confusing very quickly, and I got a lot of help from chatGPT on calculating the correct indices when mapping back and forth.

At the top of the sketch, I load all the mountain image pixel info into a 2D array. Then the draw() loop iterates through that array to draw the mountain. I thought I might need to do some performance optimizations on drawing the mountain but the sketch handled it fine.


2. Eroding the mountain:
At the top of the sketch, I queue all the pixels in the mountain in the order they will erode. That way each draw() loop is pretty simple: if it's time to erode a pixel, shift the first one off the queue and mark it dead. In normal mode, one pixel is eroded every time a bird makes contact with it. In time travel mode, several pixels are eroded every frame (the exact count depends on how eroded the mountain is).


3. Drawing the background:
First I draw a gradient onto the canvas, then I sample every 10th pixel color and draw a square at that index in that color. Then I added some random noise to each square's color to give the sky some texture. In time travel mode, the background gradient colors lerp from sunrise -> afternoon -> sunset as the mountain erodes.

The background is pretty busted and is essentially being held together with craft glue and popsicle sticks.
*/

let showTitlePage = true;

let nextBirdAtSecs = 3;

let mountainImg;
let mountainPg;
let mountainImgPixelGrid;
let totalMountainPixelCount;

let backgroundPixelSize = 10;

let pixelFontHighRes;

let timeTravelMode = false;

function preload() {
  mountainImgPixelGrid = new Array(mountainImgWidth)
    .fill(null)
    .map(() => new Array(mountainImgWidth).fill(color(0)));

  mountainImg = loadImage(
    "https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/clock/assets/mountain.png"
  );
  pixelFontHighRes = loadFont(
    "https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/clock/assets/fonts/minecraft-regular.ttf"
  );

  mountainPg = createGraphics(mountainDrawnSize, mountainDrawnSize);

  backgroundPixels = new Array(mountainPg.width / backgroundPixelSize)
    .fill(null)
    .map(() =>
      new Array(mountainPg.height / backgroundPixelSize).fill(color(0))
    );

  sunriseColorTop = color(255, 133, 200);
  sunriseColorBottom = color(255, 224, 181);

  afternoonColorTop = color(33, 209, 252);
  afternoonColorBottom = color(237, 251, 255);

  nightColorTop = color(16, 8, 110);
  nightColorBottom = color(204, 118, 203);
}

function setup() {
  frameRate(100);

  loadMountain(mountainPg, mountainImg);
  queueDeadPixels();
  totalMountainPixelCount = killQueue.length;

  initializeBackgroundGradient(
    mountainPg,
    killQueue.length,
    backgroundPixelSize
  );
  createCanvas(mountainDrawnSize, mountainDrawnSize);
}

function drawTitle() {
  textFont(pixelFontHighRes);
  textSize(24);
  fill(color("white"));
  if (timeTravelMode) {
    if (killQueue.length > 0) {
      title = "TIME TRAVEL MODE ACTIVATED...";
    } else {
      title = "DAY COMPLETE! \n DAYS REMAINING: ∞";
    }
  } else {
    title = "WELCOME TO ETERNITY SIMULATOR";
  }
  textAlign(CENTER, TOP);
  textWrap(WORD);
  text(title, 0, 30, width);
}

function drawCountdown(countdownTime) {
  textFont(pixelFontHighRes);
  textSize(24);
  textAlign(CENTER, BOTTOM);

  fill(color("white"));
  text(
    "NEXT BIRD IN: " + countdownTime.toLocaleString() + " SECONDS",
    0,
    height - 10,
    width
  );
}

//got chatgpt help to center text in the canvas
function drawTitlePage() {
  textFont(pixelFontHighRes);
  textSize(24);
  fill("white");
  textWrap(WORD);
  textAlign(CENTER, CENTER);

  let padding = 50; // margin from left/right edges
  let boxWidth = width - padding * 2;

  text(
    "ONCE EVERY THOUSAND YEARS a little bird comes to this mountain to sharpen its beak.\n\n" +
      "When the mountain has thus been worn away, a single day of eternity will have passed.\n\n" +
      "- Hendrik Willem Van Loon \n\n\n\n " +
      "Click to continue...",
    width / 2 - boxWidth / 2,
    height / 2 - 300,
    boxWidth,
    600
  );
}
let bird;

function draw() {
  if (showTitlePage) {
    mountainPg.background(color("black"));
    image(mountainPg, 0, height - mountainDrawnSize);
    drawTitlePage();

    return;
  }
  mountainPg.background(100);
  drawBackground(mountainPg, 10, killQueue.length); //background lerps through colors based on how eroded the mountain is
  drawMountain(mountainPg);

  if (timeTravelMode) {
    //start slow, then speed up so it's more visually interesting, then slow for the last few rows
    let pixelsToKillCount = 3;
    if (killQueue.length < (5/6) * totalMountainPixelCount) {
      pixelsToKillCount = 7;
    }
    if (killQueue.length < 256) {
      pixelsToKillCount = 2;
    }
    if (killQueue.length < 128) {
      pixelsToKillCount = 1;
    }

    for (let i = 0; i < pixelsToKillCount; ++i) {
      killMountainPixel(); //in time travel mode, kill a mountain pixel on every frame
    }
  } else {
    if (bird) {
      bird.advance();
      bird.draw(mountainPg);
      if (!bird.alive) {
        bird = null;
      }
    }
  }

  image(mountainPg, 0, height - mountainDrawnSize);

  drawTitle();
  if (!timeTravelMode) {
    let countdownTime = secsUntilBird();
    if (countdownTime == -1) {
      countdownTime = 0; //fixing a weird little rendering thing when the clock resets
      bird = new Bird(killQueue[0]);
      resetBirdClock(birdIntervalSecs);
    }
    if (bird){
      countdownTime = 0; //show 0 while bird is in frame
    }
    drawCountdown(countdownTime);
  }
}

function doubleClicked() {
  timeTravelMode = true;
}

function mouseClicked() {
  if (showTitlePage){ //mouseClicked() gets triggered when doubleClicked() gets triggered, so this avoids some weird clock rendering when switching to time travel mode
    resetBirdClock(5);
  }
  showTitlePage = false;
}
