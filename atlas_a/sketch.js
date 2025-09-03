
import './linearalgebra.js';
import './objects.js';
import './renderers.js';

/**
 * README:
 * Welcome to my funky little A!
 * Click and hold mouse within the A to generate more lines, and outside the A to generate fewer lines.
 * Drag mouse up and down to change the A's shape. 
 * Double click to toggle rave mode. 
 */

// Here are the modes you can try!
const ConnectorMode = Object.freeze({
  LINES: Symbol("lines"), //straight lines that don't move
  CURVES: Symbol("curves"), //curves that follow the mouse
  ANIMATED_CURVES: Symbol("animated_curves"), //drag and drop the curves with the mouse
});

// Modify me to switch between modes!
const connectorMode = ConnectorMode.ANIMATED_CURVES;

const canvasHeight = 500;
const canvasWidth = 400;
const margin = 40;

let lineCount = 0;
let skew = 1.5;
let letterPG;

let connectionRenderer;

let raveMode = false;
let rave;


function setup() {
  createCanvas(canvasWidth, canvasHeight);
  letterPG = createGraphics(canvasWidth - (margin * 2), canvasHeight - (margin * 2));
  switch (connectorMode) {
    case ConnectorMode.LINES:
      connectionRenderer = new StraightLineRenderer();
      break;
    case ConnectorMode.CURVES:
      connectionRenderer = new CurveRenderer();
      break;
    case ConnectorMode.ANIMATED_CURVES:
      connectionRenderer = new AnimatedCurveRenderer();
      break;
  }
  rave = new Rave();
}

function draw() {
  let backgroundColor = color('white');
  if (raveMode) {
    backgroundColor = color('black');
  }
  background(backgroundColor);
  letterPG.background(backgroundColor);

  rave.advanceColors();
  drawLetter(letterPG);

  //I think I'm drawing one image on top of another forever? 
  //Should replace the image instead right?
  image(letterPG, margin, margin);
}

function generateLinePoints(line, numPoints) {
  const linePoints = [];

  const lineW = line.dest.x - line.origin.x;
  const lineH = line.dest.y - line.origin.y;

  //used chatGPT to help with this skew exponent logic.
  for (let i = 0; i < numPoints; ++i) {
    let t = i / (numPoints - 1);   // goes 0 → 1
    t = pow(t, skew);              // skew > 1 bunches near end, skew < 1 bunches near start
    const newPoint = new Point(line.origin.x + lineW * t, line.origin.y + lineH * t);
    linePoints.push(newPoint);
  }
  return linePoints;
}

function drawConnectingLines(pg, edgeA, center, edgeB) {
  const mouseCoords = new Point(mouseX, mouseY);
  const mouseIsInTriangle = pointInTriangle(mouseCoords, center, edgeA, edgeB);

  //decide how many lines to draw
  if (mouseIsPressed) {
    if (mouseIsInTriangle) {
      lineCount += 1;
    } else {
      lineCount -= 1;
    }

    //map mouseY's height to a skew value between 1 and 3
    skew = map(mouseY, 0, canvasHeight, 1, 3);
  }

  //find N points along each leg
  const linePointsLeft = generateLinePoints(new Line(edgeA, center), lineCount);
  const linePointsRight = generateLinePoints(new Line(edgeB, center), lineCount);

  //render connection lines
  connectionRenderer.render(pg, mouseCoords, linePointsLeft, linePointsRight);

}

function drawLetter(pg) {
  const apexPoint = new Point(pg.width / 2, 0);
  const pointLeft = new Point(0, pg.height);
  const pointRight = new Point(pg.width, pg.height);

  //start by drawing the outside lines
  pg.strokeWeight(3);
  lineLeft = new Line(pointLeft, apexPoint);
  lineRight = new Line(pointRight, apexPoint);
  lineLeft.draw(pg);
  lineRight.draw(pg);
  pg.strokeWeight(1);

  //then draw interior lines
  drawConnectingLines(pg, pointLeft, apexPoint, pointRight);
}

function doubleClicked() {
  raveMode = !raveMode;
}

