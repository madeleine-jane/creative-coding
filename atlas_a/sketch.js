
import './linearalgebra.js';

const canvasWidth = 400;
const canvasHeight = 500;
const margin = 40;

const maxCurveDistance = 50;
const drawCurves = false;

let lineCount = 45;
let skew = 1.5;
let letterPG;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  constructor(origin, dest) {
    this.origin = origin;
    this.dest = dest;
  }
}

class Curve {
  constructor(origin, dest, control) {
    this.origin = origin;
    this.dest = dest;
    this.control = control;
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  letterPG = createGraphics(canvasWidth - (margin * 2), canvasHeight - (margin * 2));
}

function draw() {
  background('white');

  letterPG.background('white');

  drawLetter(letterPG);

  //I think I'm drawing one image on top of another forever? 
  //Should replace the image instead right?
  image(letterPG, margin, margin);
}

//used for debugging
function drawPoint(pg, point) {
  pg.circle(point.x, point.y, 5);
}

function drawLine(pg, l) {
  c1 = color(255);
  c2 = color(63, 191, 191);

  pg.line(l.origin.x, l.origin.y, l.dest.x, l.dest.y);
}

function drawCurve(pg, c) {
  pg.noFill();
  pg.beginShape();
  pg.vertex(c.origin.x, c.origin.y);           // move to start
  pg.quadraticVertex(c.control.x, c.control.y, c.dest.x, c.dest.y); // curve
  pg.endShape();
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

  //draw lines between the points
  for (let i = 0; i < linePointsLeft.length; ++i) {
    const lineStart = linePointsLeft[i];
    const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];

    const newLine = new Line(lineStart, lineEnd);

    if (drawCurves) {
      //determine which point along that line is closest to the mouse location
      const pointNearestMouse = linePointNearestToPoint(mouseCoords, newLine);

      if (i < linePointsLeft.length / 2) {
        // drawPoint(pg, pointNearestMouse); //FUN use this for lerping color
      }

      //create a line between that point and the mouse location
      lineToMouse = new Line(pointNearestMouse, mouseCoords);
      let curveDistance = lineLength(lineToMouse);

      if (lineLength(lineToMouse) > maxCurveDistance) {
        curveDistance = maxCurveDistance;
      }
      //create a point some distance along that line to be the control for the bezier curve
      const controlPoint = pointAlongLine(pointNearestMouse, mouseCoords, curveDistance);
      drawCurve(pg, new Curve(lineStart, lineEnd, controlPoint));

    } else {
      drawLine(pg, newLine);
    }
  }
}


function drawLetter(pg) {
  const apexPoint = new Point(pg.width / 2, 0);
  const pointLeft = new Point(0, pg.height);
  const pointRight = new Point(pg.width, pg.height);

  //start by drawing the outside lines
  const lineLeft = new Line(pointLeft, apexPoint);
  const lineRight = new Line(pointRight, apexPoint);

  pg.strokeWeight(3);
  drawLine(pg, lineLeft);
  drawLine(pg, lineRight);
  pg.strokeWeight(1);

  drawConnectingLines(pg, pointLeft, apexPoint, pointRight);
}

function SPIDERMODE(pg) {
  //find center
  //draw a circle
  //generate N points along circle
  //for each draw a lil web
  //deploy dancing spider gif
}

/**
 * So now to make it cool and pretty. Ideas:
 * - add a switch for going between lines and curves
 * - colors! line weights! lerping!
 * - SPIDER MODE
 * - uke mode? each line is a string with its own note?
 * - linear algebra mode
 * - rave mode: has the gradient lerping
 */
