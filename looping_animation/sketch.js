
var radius = 120;
var sphereDetail = 0.3;

let sphereBase;
let sphereCoordsWidth;
let sphereCoordsHeight;

let sphereCenter;
let maxMotionSpeed = 1;

let dragonFruitSphere;

function sphereVec(lat, lon) {
  var x = radius * sin(lat) * cos(lon);
  var y = radius * sin(lat) * sin(lon);
  var z = radius * cos(lat);
  return createVector(x, y, z);
}


function loadSphere() {
  let newSphere = new Array(sphereCoordsHeight)
    .fill(null)
    .map(() => new Array(sphereCoordsWidth).fill(createVector(0, 0, 0)));
  for (let i = 0; i < newSphere.length; ++i) {
    for (let j = 0; j < newSphere[i].length; ++j) {
      let lat = i * sphereDetail;
      let lon = j * sphereDetail;
      let pointCoords = sphereVec(lat, lon);
      newSphere[i][j] = pointCoords;
    }
  }
  return newSphere;

}


function drawVertices(sphere, i, j) {
  let v = sphere[i][j];
  vertex(v.x, v.y, v.z);

  if (i + 1 <= sphere.length - 1) {
    let v2 = sphere[i + 1][j];
    vertex(v2.x, v2.y, v2.z);
  }
}

function createDragonFruit(sphere) {
  //first load it into a new copy

  for (let i = 0; i < sphere.length; ++i) {
    for (let j = 0; j < sphere[i].length; ++j) {
      //move this point away from origin
      let vecFromCenter = p5.Vector.sub(sphere[i][j], sphereCenter); //make a vector that points from the position to the target
      vecFromCenter.setMag(500);

      let v = sphere[i][j].copy();
      v.add(vecFromCenter);

      sphere[i][j] = v;
      sphere[i][j] = createVector(0, 0, 0);
    }
  }
  return sphere;
}


function drawSphere(sphere) {
  for (let i = 0; i < sphere.length; ++i) {
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j < sphere[i].length; ++j) {
      //make two vertices: one at i, one at i+1
      drawVertices(sphere, i, j);
    }
    drawVertices(sphere, i, 0);
    endShape();
  }
}


function setup() {
  createCanvas(300, 300, WEBGL);
  sphereCoordsWidth = Math.ceil(TWO_PI / sphereDetail);
  sphereCoordsHeight = Math.ceil(PI / sphereDetail);
  sphereCenter = createVector(0, 0, 0, 0);

  sphereBase = loadSphere();
  dragonFruitSphere = createDragonFruit(loadSphere());
  console.log(dragonFruitSphere[3]);
}


function draw() {
  background(255);

  orbitControl();
  fill(255, 0, 0);
  // mutateSphere();
  drawSphere(dragonFruitSphere);
  // debugMode();
}