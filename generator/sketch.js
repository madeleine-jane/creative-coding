let tvBg;
let tvOverlay;


let staticArea;

let imgHeight = 700;
let imgWidth = 900;

function preload() {
  tvBg = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/generator/assets/tv_bg.png');
  //learned callbacks are a thing and this solves so many problems for me
  tvOverlay = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/generator/assets/tv_overlay.png', () => {
    staticArea = new Array(imgWidth)
      .fill(null)
      .map(() => new Array(imgHeight).fill(false));
    loadStaticArea();
  });
}

function loadStaticArea() {
  tvOverlay.loadPixels();
  for (let i = 0; i < tvOverlay.width; ++i) {
    for (let j = 0; j < tvOverlay.height; ++j) {
      let pixel = tvOverlay.get(i, j);
      if (pixel[3] == 0) {
        staticArea[i][j] = true;
      }
    }
  }
}

function pixelInStaticBounds(x, y) {
  return staticArea[x][y];
}

function setup() {
  createCanvas(900, 700);
  //staticArea is used to define the bounds of the clear areas where the static should fill in. Each row has start and stop 
}

function mouseClicked() {
  console.log('hello world');
  console.log(mouseX, mouseY);
}

function draw() {
  background(color('blue'));
  image(tvOverlay, 0, 0, width, height);
  for (let i = 0; i < staticArea.length; ++i) {
    for (let j = 0; j < staticArea.length; ++j) {
      set(i, j, color('red'));
    }
  }
}


