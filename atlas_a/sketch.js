
import './linearalgebra.js';
import './objects.js';
import './renderers.js';
import './libraries/verlet-1.0.0.js'
import VerletJS from './libraries/verlet-1.0.0.js';


const ConnectorMode = Object.freeze({
  LINES: Symbol("lines"),
  CURVES: Symbol("curves"),
  ANIMATED_CURVES: Symbol("animated_curves"),
  ROPE: Symbol("rope")
});

const canvasWidth = 400;
const canvasHeight = 500;
const margin = 40;

const connectorMode = ConnectorMode.ANIMATED_CURVES;

let lineCount = 0;
let skew = 1.5;
let letterPG;

let connectionRenderer;


class RopeRenderer {
  render(pg, mouseCoords, linePointsLeft, linePointsRight) {
    for (let i = 0; i < linePointsLeft.length; ++i) {
      const lineStart = linePointsLeft[i];
      const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];


      //TODO using verlet.js, create a line between lineStart and lineEnd
    }
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  letterPG = createGraphics(canvasWidth - (margin * 2), canvasHeight - (margin * 2));
  switch (connectorMode) {
    case ConnectorMode.LINES:
      connectionRenderer = new StraightLineRenderer();
      lineCount = 25;
      break;
    case ConnectorMode.CURVES:
      connectionRenderer = new CurveRenderer();
      lineCount = 50;
      break;
    case ConnectorMode.ANIMATED_CURVES:
      connectionRenderer = new AnimatedCurveRenderer();
      lineCount = 100;
      break;
    case ConnectorMode.ROPE:
      connectionRenderer = new RopeRenderer();
      lineCount = 40;

  }
}

function draw() {
  background('white');

  letterPG.background('white');

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


/**
 * So now to make it cool and pretty. Ideas:
 * - add a switch for going between lines and curves
 * - animation: curves fall back to being straight lines. curves follow mouse when pressed.
 * - colors! line weights! lerping!
 * - SPIDER MODE
 * - uke mode? each line is a string with its own note?
 * - linear algebra mode
 * - rave mode: has the gradient lerping
 */
