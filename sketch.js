//https://medium.com/@jamischarles/what-is-debouncing-2505c0648ff1
//We use debouncing to do a quick pinch click interaction
//We wait for a few milliseconds before "clicking" / pinching
//This helps with noisy input, like losing tracking of the fingers

let handpose;
let video;
let predictions = [];
let pinchTimeout;
let pinchStarted = false;
let randColor;
const timeToWait = 400;//400 millis, keep it small but not to small
let shapeX =[];
let shapeY= [];
let r = 60;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);
  // This sets up an event that fills the global variable "predictions"

  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();

  randColor = pickRandomColor();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  image(video, 0, 0, width, height);//draw the live camera
  drawShapes();

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  doPinch();
  drawTouch();

}

//draw pinch
function doPinch() {
  if(predictions.length > 0){
    for (let i = 0; i < predictions.length; i += 1) {
      const prediction = predictions[i];
      //get our thumb and index finger
      const indexF = prediction.annotations.indexFinger[3];
      const thumb = prediction.annotations.thumb[3];

      //draw top of thumb and index finger circle
      noStroke();
      push();
      fill(255, 255, 0);
      ellipse(indexF[0], indexF[1], 10, 10);
      pop();
      push();
      fill(255, 0, 0);
      ellipse(thumb[0], thumb[1], 10, 10);
      pop();

      //each digit is represented by an array of 4 sets of xyz coordinates, e.g.
      //x -> thumb[0]
      //y -> thumb[1]
      //z -> thumb[2]

      //get distance between x & y coordinates of thumb & finger
      let pinchDist = dist(thumb[0], thumb[1],indexF[0], indexF[1]);
      //the z position from camera is a bit noisy, but this scales the distance to check against by z pos
      let zOffset = map(thumb[2],20,-50,20,100);
      //console.log(zOffset,thumb[2] );

      if( pinchDist < zOffset){
        pinchStarted = true;
        if(pinchTimeout) clearTimeout(pinchTimeout);
        
        // draw pinch debug circle
        noStroke();
        push();
        fill(0, 255, 0);
        ellipse(indexF[0], indexF[1], 20, 20);
        pop();
        push();
        fill(0, 255, 0);
        ellipse(thumb[0], thumb[1], 20, 20);
        pop();


        push();
        let pointX = (thumb[0]+indexF[0])/2;
        let pointY = (thumb[1]+indexF[1])/2;
        pop();
        //if pinch on shape, change the color and shape
        for (let i=0;i<5;i+=1){
          if( shapeX[i] - r/2 < pointX && pointX < shapeX[i]+ r/2 && shapeY[i] - r/2 < pointY && pointY < shapeY[i] + r/2 ){
            push();
            fill(randColor);
            ellipse(shapeX[i],shapeY[i],r+30);
            pop();
            }
          }

      }else if(pinchStarted){
        pinchStarted = false;
        
         //store reference to our timeout so we can clear it to stop the event being fired
        //start pinch timeout on release of fingers
        pinchTimeout = window.setTimeout(pinch,timeToWait);//pinch is the callback function which will be run after 300 milliseconds
        console.log("click");
      }
    }

  }else{
    //clear our click if we lose tracking of hand
    pinchStarted = false;
     //at other places in the code we can prevent pinch being called by clearing timeout
    if(pinchTimeout) clearTimeout(pinchTimeout);
  }
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 5, 5);
      
    }
  }
}


function drawTouch() {
  //draw sentence
  textSize(20);
  strokeWeight(0.5);
  textAlign(LEFT, TOP);
  push();
  fill(0);
  text('Pinch the shape Slowly! Give it a try.',20,20);
  pop();
}

function pinch(){
  //do something more interesting here
  randColor = pickRandomColor();
}

function pickRandomColor(){
  let c = color(random(255),random(255),random(255));
  return c;
}

function drawShapes(){
  
  
  for (let x = 150; x <= 800; x+=300){
    for (let y = 120; y<= 400; y+=250){
      push();
      fill(255,255,255,150);
      noStroke;
      rectMode(CENTER);
      rect(x,y,r,r);
      shapeX.push(x);
      shapeY.push(y);
      pop();
    }
  }
 
 
}


