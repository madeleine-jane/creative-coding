


/**
 * Welcome to migration station! Keep an eye out for birds.
 * Double-click to look through the other posters. 
 */

import './boids.js';
import './base.js';
import './spiders.js';
import './birds.js';
import './fish.js';

let migrationStationPoster;
let spiderPoster;
let fisheryPoster;

let posterIdx = 0;
let posters = [];

let migrationStationOverlay;
let fisheryOverlay;

function preload() {
  birdUp = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_up.png');
  birdDown = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/b_down.png');
  spiderImageA = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_one.png');
  spiderImageB = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/spider_two.png');
  migrationStationPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station.png');
  spiderPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/spiders_v2.png');
  fisheryPoster = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/chromatic_fishery.png');
  migrationStationOverlay = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/migration_station_overlay.png');
  fisheryOverlay = loadImage('https://raw.githubusercontent.com/madeleine-jane/creative-coding/main/poster/assets/poster_backgrounds/chromatic_fishery_overlay.png');

  loadFishImages();
}


let canvasW = 600;
let canvasH = 800;

function setup() {
  createCanvas(canvasW, canvasH);
  posters = [
    new Poster(new BirdSpawner(), migrationStationPoster, migrationStationOverlay),
    new Poster(new FishSpawner(), fisheryPoster, fisheryOverlay),
    new Poster(new SpiderSpawner(), spiderPoster),
  ];
}

function draw() {
  let poster = posters[posterIdx];
  poster.bgImg.resize(canvasW, canvasH);
  image(poster.bgImg, 0, 0);
  poster.spawner.run();
  if (poster.overlay) {
    poster.overlay.resize(canvasW, canvasH);
    image(poster.overlay, 0, 0);
  }
}

function doubleClicked() {
  ++posterIdx;
  if (posterIdx == posters.length) {
    posterIdx = 0;
  }
  posters[posterIdx].spawner.reset();
}

