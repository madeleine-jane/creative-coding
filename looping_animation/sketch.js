
var radius = 120;
var sphereDetail = 0.2;

let sphereBase;
let sphereCoordsWidth;
let sphereCoordsHeight;

let sphereCenter;
let maxMotionSpeed = 1;

let dragonFruitSphere;
let lemonSphere;
let strawberrySphere;
let peachSphere;
let melonSphere;

let currentSphere;

function sphereVec(lat, lon) {
  var x = radius * sin(lat) * cos(lon);
  var y = radius * cos(lat);           // poles on Y axis
  var z = radius * sin(lat) * sin(lon);
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
  for (let i = 0; i < sphere.length; i += 3) {
    for (let j = 0; j < sphere[i].length; j += 3) {
      let vecFromCenter = p5.Vector.sub(sphere[i][j], sphereCenter);
      vecFromCenter.setMag(30);
      sphere[i][j].add(vecFromCenter);
    }
  }
  return sphere;
}


function createLemon(sphere) {
  //create points above and below on y axis
  let vecTop = createVector(0, (-1 * radius) - 30, 0);
  let vecBottom = createVector(0, radius + 30, 0);

  let stretchMagnitude = 34;
  let distanceMultiplier = 1;

  //stretch towards the top and bottom
  for (let i = 0; i < sphere.length / 2; ++i) {
    distanceMultiplier -= (1 / (sphere.length / 2))
    for (let j = 0; j < sphere[i].length; ++j) {
      let vecToBottom = p5.Vector.sub(vecBottom, sphere[i][j]);
      vecToBottom.setMag(stretchMagnitude * distanceMultiplier); //accidentally made a donut by pulling the points towards the opposite end- good for a peach!
      sphere[i][j].add(vecToBottom);

      let vecToTop = p5.Vector.sub(vecTop, sphere[sphere.length - 1 - i][sphere[i].length - 1 - j]);
      vecToTop.setMag(stretchMagnitude * distanceMultiplier);
      sphere[sphere.length - 1 - i][sphere[i].length - 1 - j].add(vecToTop);

    }
  }

  return sphere;
}

function createStrawberry(sphere) {
  //create points above and below on y axis
  let vecTop = createVector(0, (-1 * radius) + 100, 0);
  let vecBottom = createVector(0, radius + 80, 0);

  let stretchMagnitude = 60;
  let distanceMultiplier = 1;

  //stretch towards the bottom, push in the top
  for (let i = 0; i < sphere.length / 2; ++i) {
    distanceMultiplier -= (1 / (sphere.length / 2))
    for (let j = 0; j < sphere[i].length; ++j) {
      let vecToBottom = p5.Vector.sub(vecBottom, sphere[i][j]);
      vecToBottom.setMag(stretchMagnitude * distanceMultiplier);
      sphere[i][j].add(vecToBottom);

      let vecToTop = p5.Vector.sub(vecTop, sphere[sphere.length - 1 - i][sphere[i].length - 1 - j]);
      vecToTop.setMag(stretchMagnitude * distanceMultiplier);
      sphere[sphere.length - 1 - i][sphere[i].length - 1 - j].add(vecToTop);
    }
  }

  //make indents for seeds
  for (let i = 0; i < sphere.length; i += 2) {
    for (let j = 0; j < sphere[i].length; j += 2) {
      let vecToCenter = p5.Vector.sub(sphereCenter, sphere[i][j]);
      vecToCenter.setMag(5);
      sphere[i][j].add(vecToCenter);
    }
  }

  return sphere;
}

function createPeach(sphere) {
  //for making a hat
  // for (let i = 0; i < sphere[0].length; ++i){
  //   let vecFromBelow = p5.Vector.sub(sphere[sphere.length - 1][i], sphere[sphere.length - 2][i])
  //   vecFromBelow.setMag(50);
  //   sphere[sphere.length - 1][i].add(vecFromBelow);
  // }

  //create points above and below on y axis
  let vecTop = createVector(0, (-1 * radius) - 30, 0);
  let vecBottom = createVector(0, radius + 30, 0);

  let stretchMagnitude = 52;
  let distanceMultiplier = 1;

  //stretch towards the top and bottom
  for (let i = 0; i < Math.ceil(sphere.length / 2); ++i) {
    distanceMultiplier -= (1 / (sphere.length / 2))
    for (let j = 0; j < sphere[i].length; ++j) {
      let vecToCenter = p5.Vector.sub(sphereCenter, sphere[sphere.length - 1 - i][sphere[i].length - 1 - j]);
      vecToCenter.setMag(stretchMagnitude * distanceMultiplier * 1.5);
      sphere[sphere.length - 1 - i][sphere[i].length - 1 - j].add(vecToCenter);

      vecToCenter = p5.Vector.sub(sphereCenter, sphere[i][j]);
      vecToCenter.setMag(stretchMagnitude * distanceMultiplier * 0.2);
      sphere[i][j].add(vecToCenter);
    }
  }
  return sphere;
}

function createMelon(sphere) {
  //indent stripes
  for (let i = 0; i < sphere.length; ++i) {
    for (let j = 0; j < sphere[i].length; j += 4) {
      vecToCenter = p5.Vector.sub(sphereCenter, sphere[i][j]);
      vecToCenter.setMag(10);
      sphere[i][j].add(vecToCenter);
    }
  }
  return sphere
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

let fruits;
let fruitTargetIdx = 0;

function setup() {
  createCanvas(500, 500, WEBGL);
  sphereCoordsWidth = Math.ceil(TWO_PI / sphereDetail);
  sphereCoordsHeight = Math.ceil(PI / sphereDetail);
  sphereCenter = createVector(0, 0, 0, 0);

  currentSphere = loadSphere();
  dragonFruitSphere = createDragonFruit(loadSphere());
  lemonSphere = createLemon(loadSphere());
  strawberrySphere = createStrawberry(loadSphere());
  peachSphere = createPeach(loadSphere());
  melonSphere = createMelon(loadSphere());

  fruits = [
    dragonFruitSphere,
    strawberrySphere,
    melonSphere,
    peachSphere,
    lemonSphere,
  ]
}

/**
 * TODO:
 * - fruits morph into each other on a loop
 * - create twigs and leaves
 * - figure out camera rotation
 * - draw textures
 * - play with panorama
 */



/**
 * first make it constantly morph and then do quick and pause
 */

let morphSpeed = 1;

function morphComplete(current, target) {
  for (let i = 0; i < current.length; ++i) {
    for (let j = 0; j < current[i].length; ++j) {
      if (
        current[i][j].x != target[i][j].x ||
        current[i][j].y != target[i][j].y ||
        current[i][j].z != target[i][j].z
      ) {
        return false;
      }
    }
  }
  return true;
}
function morphSphere(current, target) {
  console.log(target);
  for (let i = 0; i < current.length; ++i) {
    for (let j = 0; j < current[i].length; ++j) {
      let distToTarget = current[i][j].dist(target[i][j]);
      vecToTarget = p5.Vector.sub(target[i][j], current[i][j]);
      vecToTarget.setMag(min(morphSpeed, distToTarget));
      current[i][j].add(vecToTarget);
    }
  }
}

function draw() {
  background(255);

  orbitControl();
  fill(255, 0, 0);
  morphSphere(currentSphere, fruits[fruitTargetIdx]);
  if (morphComplete(currentSphere, fruits[fruitTargetIdx])) {
    fruitTargetIdx = (fruitTargetIdx + 1) % fruits.length;
  }
  drawSphere(currentSphere);
}