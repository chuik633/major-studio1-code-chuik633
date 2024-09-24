let animationSpeed = 0.006
let noiseZoom = 0.002

function setup() {
  createCanvas(windowWidth, 100);
  stroke(255); 
  strokeWeight(1); 
  noFill(); 
}

function draw() {
  background(0); 
//   console.log("DRAWING") 
  
  beginShape();  // Begin drawing the shape

  for (let x = 0; x <= width; x += .5) {
    let y = noise(x*noiseZoom, frameCount * animationSpeed)*100;

    vertex(x , y );
  }
  endShape(); 
}