let video = document.createElement("video");
video.autoplay = true;

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.log("Something went wrong! " + error);
    });
}

let canvas = document.querySelector("#canvas")
let ctx = canvas.getContext("2d");
window.requestAnimationFrame(loop, canvas);
let track = null;
let settings = null;

let tempCanvas = document.createElement("canvas");
let tempCtx = tempCanvas.getContext("2d");

let secondCanvas = document.createElement("canvas");
let secondCtx = secondCanvas.getContext("2d");

let currentDisplay = "Gray Scale"
let timeDisplayed = 0

function loop() {
  if (video.srcObject || track) {
    track = video.srcObject.getTracks()[0];
    settings = track.getSettings();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let videoWidth = settings.width;
    let videoHeight = settings.height;

    tempCanvas.width = videoWidth;
    tempCanvas.height = videoHeight;
    secondCanvas.width = videoWidth;
    secondCanvas.height = videoHeight;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let scaleX = 1;
    let scaleY = 1;
    let proposedScaleX = window.innerWidth / settings.width;
    let proposedScaleY = window.innerHeight / settings.height;
    let scale = Math.min(proposedScaleX, proposedScaleY);



    let offsetX = 0;
    let offsetY = 0;



    if (scale != proposedScaleX) {
      offsetX = (proposedScaleX - scale) * videoWidth / 2
    }
    else {
      offsetY = (proposedScaleY - scale) * videoHeight / 2
    }

    tempCtx.drawImage(video, 0, 0, settings.width, settings.height);

    let pixels = tempCtx.getImageData(0, 0, settings.width, settings.height);
    switchDisplay(pixels, videoHeight, videoWidth)

    secondCtx.putImageData(pixels, 0, 0);
    timeDisplayed++;
    console.log(timeDisplayed)

    ctx.drawImage(secondCanvas, 0, 0, videoWidth, videoHeight,
      offsetX, offsetY, scale * videoWidth, scale * videoHeight);

    window.requestAnimationFrame(loop, canvas);
  }
  else {
    ctx.fillStyle = "magenta"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(loop, canvas);

  }
}


function switchDisplay(pixels, videoHeight, videoWidth) {
  
  if (currentDisplay == "Gray Scale") {
    if (timeDisplayed < 1000) {
      displayGreyScreen(pixels, videoHeight, videoWidth)
    }
    else {
      currentDisplay = "Black Screen"
      timeDisplayed = 0
    }
  }
  if (currentDisplay == "Black Screen") {
    if (timeDisplayed < 1000) {
      displayBlackScreen(pixels, videoHeight, videoWidth)
    }
    else {
      currentDisplay = "Gray Scale"
      timeDisplayed = 0
    }
  }
}

function displayBlackScreen(pixels, videoHeight, videoWidth) {
  for(let y = 0; y < videoHeight;y++){
    for(let x =0; x< videoWidth;x++){
      let pixelIndex = videoWidth * 4 * y + x * 4;
      pixels.data[pixelIndex] = 0
      pixels.data[pixelIndex+1] = 0
      pixels.data[pixelIndex+2] = 0
    }
  }
}


function displayGreyScreen(pixels, videoHeight, videoWidth) {
  for (let y = 0; y < videoHeight; y++) {
    for (let x = 0; x < videoWidth; x++) {
      //The data is linear, get the x,y coordinate
      //We mulitply by 4 since it is stored as rgba
      let pixelIndex = videoWidth * 4 * y + x * 4;

      //Convert to grayscale on half the image

      let r = pixels.data[pixelIndex];
      let g = pixels.data[pixelIndex + 1];
      let b = pixels.data[pixelIndex + 2];

      //Trivial grayscale conversion using the red channel
      g = r;
      b = r;

      //Update the pixel data
      pixels.data[pixelIndex] = r;
      pixels.data[pixelIndex + 1] = g;
      pixels.data[pixelIndex + 2] = b;

    }
  }
}