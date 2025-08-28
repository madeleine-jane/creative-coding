
import './linearalgebra.js';

const canvasWidth = 400;
const canvasHeight = 500;
const margin = 40;
let lineCount = 15;
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
  background(220);

  letterPG.background('white');

  drawLetter(letterPG);
  image(letterPG, margin, margin);
}

function drawPoint(pg, point) {
  pg.circle(point.x, point.y, 5);
}

function drawLine(pg, l) {
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



function drawLetter(pg) {
  const apexPoint = new Point(pg.width / 2, 0);
  const pointLeft = new Point(0, pg.height);
  const pointRight = new Point(pg.width, pg.height);

  //start by creating the base lines
  const lineLeft = new Line(pointLeft, apexPoint);
  drawLine(pg, lineLeft); //not sure about drawing these tbh

  const lineRight = new Line(pointRight, apexPoint);
  drawLine(pg, lineRight);

  const mouseCoords = new Point(mouseX, mouseY);
  const mouseIsInTriangle = pointInTriangle(mouseCoords, apexPoint, pointLeft, pointRight);

  //decide how many lines to draw
  if (mouseIsPressed) {
    if (mouseIsInTriangle) {
      lineCount += 1;
    } else {
      lineCount -= 1;
    }

    //squishy skew on how the lines are placed
    const proportion = mouseY / canvasHeight;
    const skewRange = 2;
    skew = 1 + (skewRange * proportion);
  }

  //find N points along each leg
  const linePointsLeft = generateLinePoints(lineLeft, lineCount);
  const linePointsRight = generateLinePoints(lineRight, lineCount);

  //draw lines between the points
  const connectingLines = [];
  for (let i = 0; i < linePointsLeft.length; ++i) {
    const lineStart = linePointsLeft[i];
    const lineEnd = linePointsRight[(linePointsRight.length - 1) - i];

    const newLine = new Line(lineStart, lineEnd);

    //to draw the straight lines:
    // drawLine(pg, newLine);

    const pointNearestMouse = linePointNearestToPoint(mouseCoords, newLine);

    drawPoint(pg, pointNearestMouse); //FUN use this for lerping color
    if (i < linePointsLeft.length / 2) {
    }

    lineToMouse = new Line(pointNearestMouse, mouseCoords);
    let curveDistance = lineLength(lineToMouse);
    const maxCurveDistance = 25;

    if (lineLength(lineToMouse) > maxCurveDistance) {
      curveDistance = maxCurveDistance;
    }

    const controlPoint = pointAlongLine(pointNearestMouse, mouseCoords, curveDistance);
    drawCurve(pg, new Curve(lineStart, lineEnd, controlPoint));

    connectingLines.push(newLine);
  }
}

/**
 * So now to make it cool and pretty. Ideas:
 * - colors! line weights! lerping!
 * - bezier curves for all lines
 * - SPIDER MODE
 */
