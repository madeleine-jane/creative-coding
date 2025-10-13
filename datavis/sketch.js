
/* jshint esversion: 9 */

let api_key = 'b520f5854fb5428d8a4b32f10dcc9528'; //TODO: put this somewhere more secure
let lines = {};
let dataLoaded = false;

let pg;
const margin = 40;

function mapCoordsToCanvasCoords(lat, lon) {
  let x = map(lon, -77.12, -76.9, 0, pg.width - 10);
  let y = map(lat, 38.8, 39.05, pg.height - 10, 0);
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

function loadLines(callback) {
  loadJSON('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/datavis/assets/wmata_data.json',
    callback
  );
}

function drawStations(stations) {
  if (!stations) return;
  stations.forEach(station => {
    if (station && station.lat && station.lon) {
      pg.circle(station.x, station.y, 3);
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
    pg.strokeWeight(6);
    pg.stroke(lineColor(lineCode));
    pg.line(stationA.x, stationA.y, stationB.x, stationB.y);
    pg.pop();
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
      let xOffsetStep = 4; // Pixels to offset each station horizontally

      for (let index = 0; index < occurrences.length; index++) {
        let occurrence = occurrences[index];
        let xOffset = index * xOffsetStep;

        // Apply X offset to the station in this specific line
        occurrence.station.x += xOffset;
      }

      console.log(`Offset station ${stationCode} across ${occurrences.length} lines with X offsets`);
    }
  }
}

function setup() {
  createCanvas(500, 500);
  pg = createGraphics(width - (margin * 2), height - (margin * 2));

  loadLines(function (data) {
    lines = data;
    assignCanvasCoordsToStations();
    offsetCanvasCoordsOnOverlappingStations();
    dataLoaded = true;
    // Add your additional API calls here
    // For example:
    // loadAdditionalData();
    // processStationDetails();
  });
}

function draw() {
  background(220);

  if (!dataLoaded) {
    // Show loading message while data is being fetched
    fill(0);
    textAlign(CENTER, CENTER);
    text('Loading WMATA data...', width / 2, height / 2);
    return;
  }

  // Clear the graphics buffer
  pg.background(255);

  // Draw all the metro lines
  for (let lineCode in lines) {
    if (lines[lineCode].stations) {
      drawStations(lines[lineCode].stations);
      connectStations(lineCode, lines[lineCode].stations);
    }
  }

  // Display the graphics buffer
  image(pg, margin, margin);
}
