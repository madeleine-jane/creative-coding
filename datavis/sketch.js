
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

function getLines() {
  return new Promise((resolve, reject) => {
    let url = 'http://api.wmata.com/Rail.svc/json/jLines?api_key=' + api_key;
    loadJSON(url,
      function (data) {
        let lineCodes = data.Lines.map(line => ({
          lineCode: line.LineCode,
          startStationCode: line.StartStationCode,
          endStationCode: line.EndStationCode
        }));
        resolve(lineCodes);
      },
      function (error) {
        reject(error);
      }
    );
  });
}

function getStations(lineCode) {
  return new Promise((resolve, reject) => {
    let url = 'http://api.wmata.com/Rail.svc/json/jStations?LineCode=' + lineCode + '&api_key=' + api_key;
    loadJSON(url,
      function (data) {
        let stations = data.Stations.map(station => ({
          code: station.Code,
          name: station.Name,
          lat: station.Lat,
          lon: station.Lon
        }));
        resolve(stations);
      },
      function (error) {
        reject(error);
      }
    );
  });
}

function getStationSequence(lineCode, startStationCode, endStationCode) {
  return new Promise((resolve, reject) => {
    let url = 'http://api.wmata.com/Rail.svc/json/jPath?FromStationCode=' + startStationCode + '&ToStationCode=' + endStationCode + '&api_key=' + api_key;
    loadJSON(url,
      function (data) {
        let stationSequence = data.Path.map(station => ({
          code: station.StationCode,
          sequenceNum: station.SeqNum
        }));
        resolve(stationSequence);
      },
      function (error) {
        reject(error);
      }
    );
  });
}


async function processLine(lineResult) {
  try {
    // Get stations for this line
    const stationResults = await getStations(lineResult.lineCode);

    // Get station sequence
    const stationSequence = await getStationSequence(
      lineResult.lineCode,
      lineResult.startStationCode,
      lineResult.endStationCode
    );

    // Sort stations based on sequence number
    stationSequence.sort((a, b) => a.sequenceNum - b.sequenceNum);

    // Map sorted station codes to full station details
    const orderedStations = stationSequence.map(seq =>
      stationResults.find(station => station.code === seq.code)
    );

    // Store the complete line data
    lines[lineResult.lineCode] = {
      ...lineResult,
      stations: orderedStations
    };

  } catch (error) {
    console.error(`Error processing line ${lineResult.lineCode}:`, error);
  }
}

async function loadAllData() {
  try {
    const lineResults = await getLines();

    // Process all lines in parallel
    await Promise.all(lineResults.map(lineResult => processLine(lineResult)));

    // Mark data as loaded
    dataLoaded = true;
    console.log('All data loaded successfully!');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function drawStations(stations) {
  if (!stations) return;
  stations.forEach(station => {
    if (station && station.lat && station.lon) {
      let coords = mapCoordsToCanvasCoords(station.lat, station.lon);
      pg.ellipse(coords.x, coords.y, 5, 5);
    }
  });
}

function setup() {
  createCanvas(400, 400);
  pg = createGraphics(width - (margin * 2), height - (margin * 2));

  // Load all data asynchronously
  loadAllData();
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
      pg.fill(lineColor(lineCode));
      drawStations(lines[lineCode].stations);
    }
  }

  // Display the graphics buffer
  image(pg, margin, margin);
}
