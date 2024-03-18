const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasHeight = canvas.getAttribute("height");
const canvasWidth = canvas.getAttribute("width");

const gridHeight = 40;
const gridWidth = 40;

let startPosSelected = false;
let endPosSelected = false;
let barriersSelected = false;

const startPosition = {};
const endPosition = {};
const barricadePositions = new Set();


function drawGrid() {
  ctx.strokeStle = "#181818";

  for (let x = 0; x < canvasWidth; x += gridWidth) {
    ctx.beginPath();
    ctx.moveTo(x + gridWidth, 0);
    ctx.lineTo(x + gridWidth, canvasWidth);
    ctx.stroke();
  }

  for (let y = 0; y < canvasHeight; y += gridHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y + gridHeight);
    ctx.lineTo(canvasWidth, y + gridHeight);
    ctx.stroke();
  }
}


ctx.fillStyle = "#efefef";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
drawGrid();

canvas.addEventListener("click", event => {
  let clickedX = Math.floor(event.offsetX / gridWidth);
  let clickedY = Math.floor(event.offsetY / gridHeight);

  if (!startPosSelected) {
    ctx.fillStyle = "#00bb00";
    startPosition.x = clickedX;
    startPosition.y = clickedY;
    startPosSelected = true;
  } else if (!endPosSelected) {
    ctx.fillStyle = "#bb0000";
    if (clickedX === startPosition.x && clickedY === startPosition.y) {
      return;
    }
    endPosition.x = clickedX;
    endPosition.y = clickedY;
    endPosSelected = true;
  } else {
    ctx.fillStyle = "#181818";
    if ((clickedX === startPosition.x && clickedY === startPosition.y)
      || (clickedX === endPosition.x && clickedY === endPosition.y)) {
      return;
    }
  }
  ctx.fillRect(gridWidth * clickedX, gridHeight * clickedY, gridWidth, gridHeight);
});

document.addEventListener('DOMContentLoaded', (_) => {
  const startButton = document.getElementById("start-game-btn");
  startButton.addEventListener('click', startGame);
});

function startGame(event) {
  console.log(event);
}