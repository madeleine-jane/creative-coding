class ExpandedPixel {
  constructor(pixelColor, x, y, expansionMultiplier){
    this.pixelColor = pixelColor;
    this.x = x;
    this.y = y;
    this.expansionMultiplier = expansionMultiplier;
  }

}

function pixelIdxToCoordinates(pixelIdx, imageWidth) {
  // Convert raw pixels[] index into pixel number
  const pixelNumber = Math.floor(pixelIdx / 4);
  const x = pixelNumber % imageWidth;
  const y = Math.floor(pixelNumber / imageWidth);
  return [x, y];
}

function coordinatesToPixelIdx(x, y, imageWidth) {
  // Convert pixel coordinates back into raw pixels[] index
  return (y * imageWidth + x) * 4;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}