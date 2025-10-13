
/* jshint esversion: 9 */

let lines = {};
let trains = [];

let pg;
const margin = 40;

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}


class Train {
  constructor(line, targetStationIdx, direction) {
    this.line = line;
    this.targetStationIdx = targetStationIdx;
    this.direction = direction;
    this.speed = 1;
    this.stationPauseTime = 30;
    this.stationPauseCountdown = 0;
    this.setStartingPosition();
  }
  targetVec() {
    return createVector(lines[this.line].stations[this.targetStationIdx].x, lines[this.line].stations[this.targetStationIdx].y);
  }
  setStartingPosition() {
    if (this.targetStationIdx > 0) {
      let prevIdx = this.targetStationIdx - 1;
      let prevVec = createVector(lines[this.line].stations[prevIdx].x, lines[this.line].stations[prevIdx].y);
      let startingDist = map(getRandomFloat(0, 1), 0, 1, 0, this.targetVec().dist(prevVec));

      let distVec = prevVec.sub(this.targetVec());
      distVec.setMag(startingDist);

      this.location = this.targetVec().add(distVec);
    }
  }

  advanceTowardsStation() {
    if (this.stationPauseCountdown > 0) {
      this.stationPauseCountdown--;
      return;
    }
    if (this.hasArrived() && this.stationPauseCountdown == 0) {
      this.stationPauseCountdown = this.stationPauseTime; // Pause for 30 frames at the station
      this.chooseNextStation();
    }
    let vecToTarget = p5.Vector.sub(this.targetVec(), this.location);
    vecToTarget.setMag(this.speed);
    this.location.add(vecToTarget);
  }
  hasArrived() {
    return this.location.dist(this.targetVec()) < this.speed;
  }
  chooseNextStation() {
    if (this.targetStationIdx == 0 && this.direction == -1) {
      this.direction = 1;
    }
    if (this.targetStationIdx == lines[this.line].stations.length - 1 && this.direction == 1) {
      this.direction = -1;
    }

    if (this.direction == 1) {
      ++this.targetStationIdx;
    } else {
      --this.targetStationIdx;
    }
  }
  draw() {
    pg.push();
    pg.fill(255);
    pg.circle(this.location.x, this.location.y, 10);
    pg.pop();
  }
}

function mapCoordsToCanvasCoords(lat, lon) {
  let x = map(lon, -77.5, -76.83, 0, pg.width);
  let y = map(lat, 38.78, 39.07, pg.height, 0);
  return { x: x, y: y };
}

function lineColor(lineCode) {
  const colors = {
    "RD": color(255, 0, 0),    // Red Line
    "OR": color(255, 165, 0),  // Orange Line
    "BL": color(0, 0, 255),    // Blue Line
    "YL": color(255, 255, 0),  // Yellow Line
    "GR": color(0, 128, 0),    // Green Line
    "SV": color(192, 192, 192) // Silver Line
  };
  return colors[lineCode] || color(0); // Default to black if line code not found
}

function parseTrainData(trainData) {
  let trainsByLine = {};
  trainData.TrainPositions.forEach(train => {
    if (!train.LineCode) {
      return;
    }
    if (!trainsByLine[train.LineCode]) {
      trainsByLine[train.LineCode] = 0;
    }
    ++trainsByLine[train.LineCode];
  });
  for (let lineCode in trainsByLine) {
    lines[lineCode].trains = trainsByLine[lineCode];
  }
}

function initializeTrains() {
  for (let lineCode in lines) {
    let numTrains = lines[lineCode].trains || 0;
    for (let i = 0; i < numTrains; i++) {
      let targetStationIdx = Math.floor(getRandomFloat(1, lines[lineCode].stations.length));
      let direction = Math.random() < 0.5 ? -1 : 1;
      let train = new Train(lineCode, targetStationIdx, direction);
      trains.push(train);
    }
  }

  for (let train of trains) {
    //pick N other train indices
    train.connectorTrains = [];
    for (let i = 0; i < 50; i++) {
      let otherTrainIdx = Math.floor(getRandomFloat(0, trains.length));
      train.connectorTrains.push(otherTrainIdx);
    }
  }
}

function assignCanvasCoordsToStations() {
  for (let lineCode in lines) {
    for (let i = 0; i < lines[lineCode].stations.length; i++) {
      let coords = mapCoordsToCanvasCoords(lines[lineCode].stations[i].lat, lines[lineCode].stations[i].lon);
      lines[lineCode].stations[i].x = coords.x;
      lines[lineCode].stations[i].y = coords.y;
    }
  }
}

function offsetCanvasCoordsOnOverlappingStations() {
  // Create a map to track which stations appear in multiple lines
  let stationOccurrences = {};

  // First pass: count how many lines each station appears in
  for (let lineCode in lines) {
    for (let station of lines[lineCode].stations) {
      if (!stationOccurrences[station.code]) {
        stationOccurrences[station.code] = [];
      }
      stationOccurrences[station.code].push({ lineCode, station });
    }
  }

  // Second pass: apply offsets to overlapping stations
  for (let stationCode in stationOccurrences) {
    let occurrences = stationOccurrences[stationCode];

    // Only offset if station appears in multiple lines
    if (occurrences.length > 1) {
      let xOffsetStep = 6; // Pixels to offset each station horizontally

      for (let index = 0; index < occurrences.length; index++) {
        let occurrence = occurrences[index];
        let xOffset = index * xOffsetStep;

        // Apply X offset to the station in this specific line
        occurrence.station.y += xOffset;
      }

    }
  }
}

function setup() {
  createCanvas(500, 500);
  pg = createGraphics(width, height);

  loadJSON('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/datavis/assets/wmata_data.json',
    function (data) {
      lines = data;
      assignCanvasCoordsToStations();
      offsetCanvasCoordsOnOverlappingStations();
      console.log(lines.SV);
    }
  );


  loadJSON('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/datavis/assets/train_locations.json',
    function (trainData) {
      parseTrainData(trainData);
      initializeTrains();
    }
  );
  frameRate(30);
}

function drawStations(stations) {
  if (!stations) return;
  stations.forEach(station => {
    if (station && station.lat && station.lon) {
      pg.push();
      pg.stroke(color('black'));
      pg.strokeWeight(2);
      pg.fill(color('white'));
      pg.circle(station.x, station.y, 6);
      pg.pop();
    }
  });
}

//ok this doesnt work because some stations overlap but i might not use this anyway
function connectStations(lineCode, stations) {
  if (!stations) return;
  for (let i = 0; i < stations.length - 1; i++) {
    let stationA = stations[i];
    let stationB = stations[i + 1];
    pg.push();
    pg.strokeWeight(3);
    pg.stroke(lineColor(lineCode));
    pg.line(stationA.x, stationA.y, stationB.x, stationB.y);
    pg.pop();
  }
}

function connectTrains() {
  for (let train of trains) {
    for (let idx of train.connectorTrains) {
      let otherTrain = trains[idx];
      pg.push();
      pg.strokeWeight(1);
      pg.line(train.location.x, train.location.y, otherTrain.location.x, otherTrain.location.y);
      pg.pop();
    }
  }
}

function draw() {
  background(255);

  if (!lines) {
    // Show loading message while data is being fetched
    fill(0);
    textAlign(CENTER, CENTER);
    text('Loading WMATA data...', width / 2, height / 2);
    return;
  }


  // Clear the graphics buffer
  pg.background(255);
  // connectTrains();

  // Draw all the metro lines
  for (let lineCode in lines) {
    if (lines[lineCode].stations) {
      connectStations(lineCode, lines[lineCode].stations);
      // drawStations(lines[lineCode].stations);
    }
  }

  for (let train of trains) {
    train.advanceTowardsStation();
    train.draw();
  }

  image(pg, 0, 0);
}
