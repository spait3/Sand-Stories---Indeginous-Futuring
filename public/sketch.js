
//Speaking positive words or negative words (easy words like good, nice, great, amazing, awesome, sad, bad, ugly, etc) , it takes the response and blooms accordingly, there might be delays in processing

//export GOOGLE_APPLICATION_CREDENTIALS="/Users/sunny/Desktop/p5/olfactory-factory-2ec561e08d6b.json"

// Define variables for video input, canvas, and output image
let video;
let canvas;
let outputImage;
let socket;


//teachable mchines
let classifier;
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/a_IFwXQTS/';

// Video
let flippedVideo;
// To store the classification
let label = "";



// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

// Define variables for threshold and stroke weight
let thresholdValue = 22;
let strokeWidth = 5;

// Define variables for storing previous pixel values
let prevPixels;
let diffPixels;

function setup() {
  // Create a canvas that's the same size as the video input
  canvas = createCanvas(320, 260);
  const socket = io('http://localhost:3000');
  socket.on('message', (data) => {
    console.log('Received message from server:', data);
  });

  // Start capturing video from the webcam
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  flippedVideo = ml5.flipImage(video)
  // Start classifying
  classifyVideo();
  // Set up the canvas to use the WEBGL renderer
  pixelDensity(1);
  loadPixels();

  // Store the initial pixel values for later comparison
  prevPixels = new Uint8ClampedArray(pixels);

  // Create a new image to store the canvas sketch output
  outputImage = createImage(width, height);


  socket.on('output', (output) => {
    const newTab = window.open(output, '_blank');
    newTab.focus();
  });

  function sendOutputLabel() {
    
    // Emit the data URL through socket.io
  
    socket.emit("label", label);
    console.log("Sent label:" + label);
  }
  setInterval(sendOutputLabel, 10000);
  // Send the output image through socket.io every 500ms
  
}

function draw() {
  // Draw the video input onto the canvas
  background(0);
  image(flippedVideo, 0, 0, width, height);

  // Load the current pixel values into the pixels array
  loadPixels();

  // Calculate the difference between the current and previous pixel values
  diffPixels = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < pixels.length; i++) {
    diffPixels[i] = abs(pixels[i] - prevPixels[i]);
  }

  // Update the previous pixel values to the current values
  prevPixels.set(pixels);

  // Apply a threshold to the difference pixels to create a mask
  let mask = createImage(width, height);
  mask.loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let index = (x + y * width) * 4;
      let r = diffPixels[index];
      let g = diffPixels[index + 1];
      let b = diffPixels[index + 2];
      let a = diffPixels[index + 3];
      let sum = r + g + b;
      let value = sum / 3;
      if (value > thresholdValue) {
        mask.set(x, y, color(255));
      } else {
        mask.set(x, y, color(0));
      }
    }
  }
  mask.updatePixels();

  // Draw the mask onto the canvas, using the mask as an alpha channel
  strokeWeight(strokeWidth);
  stroke(255);
  noFill();
  image(mask, 0, 0);
  //blendMode(MULTIPLY);
  rect(0, 0, width, height);
  blendMode(BLEND);
  textSize(16);
  textAlign(CENTER);
  text(label, width / 2, height - 4);


  // Send the data URL through socket.io
  
}


// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
  // Classifiy again!
  classifyVideo();
}