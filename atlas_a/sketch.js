const canvasWidth = 400;
const canvasHeight = 500;
const margin = 40;
let lineCount = 20;

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

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  letterPG = createGraphics(canvasWidth - (margin * 2), canvasHeight - (margin * 2));
}

function draw() {
  background(220);

  letterPG.background('white');

  createLetter(letterPG);
  image(letterPG, margin, margin);
}

function drawPoint(pg, point) {
  pg.circle(point.x, point.y, 5);
}

function drawLine(pg, l) {
  pg.line(l.origin.x, l.origin.y, l.dest.x, l.dest.y);
}

function generateLinePoints(line, numPoints) {
  const linePoints = [];

  const lineW = line.dest.x - line.origin.x;
  const lineH = line.dest.y - line.origin.y;

  //used chatGPT to help with the exponentiation logic.
  const skew = 2;
  for (let i = 0; i < numPoints; ++i) {
    let t = i / (numPoints - 1);   // goes 0 → 1
    t = pow(t, skew);              // skew > 1 bunches near end, skew < 1 bunches near start
    const newPoint = new Point(line.origin.x + lineW * t, line.origin.y + lineH * t);
    linePoints.push(newPoint);
  }
  return linePoints;
}

function createLetter(pg) {
  const apexPoint = new Point(pg.width / 2, 0);

  //start by creating the base lines
  const lineLeft = new Line(new Point(0, pg.height), apexPoint);
  drawLine(pg, lineLeft);

  const lineRight = new Line(new Point(pg.width, pg.height), apexPoint);
  drawLine(pg, lineRight);

  //now divide each line up into N segments
  const linePointsLeft = generateLinePoints(lineLeft, lineCount);
  const linePointsRight = generateLinePoints(lineRight, lineCount);

  //now hook up the points
  const connectingLines = [];
  for (let i = 0; i < linePointsLeft.length; ++i) {
    const newLine = new Line(linePointsLeft[i], linePointsRight[(linePointsRight.length - 1) - i]);
    connectingLines.push(newLine);
    drawLine(pg, newLine);
  }
}

/**
 * So now to make it cool and pretty. Ideas:
 * - lines grow out towards their destinations
 * - click and hold the mouse to add more lines :)
 * - colors!
 * - skew is squishy based on where the mouse is :)
 * 
 */
