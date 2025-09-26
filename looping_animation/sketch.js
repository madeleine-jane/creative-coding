let img;
let scrollX = 0;

function preload() {
  img = loadImage('https://raw.githubusercontent.com/cacheflowe/haxademic/master/data/haxademic/images/no-signal.png');
}

function setup() {
  let gl = this._renderer.GL;

  // Get version info
  console.log("WebGL version:", gl.getParameter(gl.VERSION));
  console.log("GLSL version:", gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
  console.log("Renderer:", gl.getParameter(gl.RENDERER));
  console.log("Vendor:", gl.getParameter(gl.VENDOR));
  createCanvas(400, 350, WEBGL);
}

function draw() {
  // clear background and set context 
  // back to top-left b/c of WEBGL mode
  background(220);
  noStroke();
  translate(-width / 2, -height / 2);

  // draw as a texture on a quad, clockwise
  // from top-left. Last 2 arguments are
  // UV coordinates after x/y/z
  scrollX += (width / 2 - mouseX) * 0.0004;
  let tile = map(mouseY, 0, height, 1, 4);
  texture(img);
  textureMode(NORMAL); // normalized UV coordinates, rather than pixel dimensions
  textureWrap(REPEAT); // repeating texture for scrolling/tiling
  beginShape();
  vertex(100, 100, 0, 0 + scrollX, 0);
  vertex(300, 100, 0, tile + scrollX, 0);
  vertex(300, 240, 0, tile + scrollX, tile);
  vertex(100, 240, 0, 0 + scrollX, tile);
  endShape();

}