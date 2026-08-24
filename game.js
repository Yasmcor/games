/* 1. JOGO DE BLOCOS (BREAKOUT)*/

let breakoutCanvas, breakoutCtx;
let bX, bY, bDx, bDy;
const ballRadius = 6;
const DEFAULT_PADDLE_WIDTH = 85;
const DEFAULT_PADDLE_SPEED = 7;
let paddleHeight = 12, paddleWidth, paddleX, paddleSpeed;
let expandTimeout = null, speedTimeout = null;
let rightPressed = false, leftPressed = false;

const rowCount = 6, colCount = 9;
const brickWidth = 46, brickHeight = 14, brickPadding = 6;
const brickOffsetTop = 40, brickOffsetLeft = 18;
const rowColors = ["#f2427a", "#fa7268", "#f8c257", "#39c2d7", "#9b51e0", "#2ad2a0"];

let breakoutScore = 0, powerups = [], bricks = [];
let breakoutAnimationFrame;

function initBreakout() {
  breakoutCanvas = document.getElementById("myCanvas");
  breakoutCtx = breakoutCanvas.getContext("2d");

  bX = breakoutCanvas.width / 2;
  bY = breakoutCanvas.height - 30;
  bDx = 3; bDy = -3;
  paddleWidth = DEFAULT_PADDLE_WIDTH;
  paddleSpeed = DEFAULT_PADDLE_SPEED;
  paddleX = (breakoutCanvas.width - paddleWidth) / 2;
  breakoutScore = 0;
  powerups = [];

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: rowColors[r % rowColors.length] };
    }
  }

  if (breakoutAnimationFrame) cancelAnimationFrame(breakoutAnimationFrame);
  drawBreakout();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myCanvas");
  if (canvas) {
    canvas.addEventListener("touchmove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      paddleX = touchX - paddleWidth / 2;
      if (paddleX < 0) paddleX = 0;
      if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
      e.preventDefault();
    }, { passive: false });
  }
});

function drawBreakout() {
  breakoutCtx.fillStyle = "#1a181e";
  breakoutCtx.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);

  for (let c = 0; c < colCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      if (bricks[c][r].status === 1) {
        const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const by = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = bx; bricks[c][r].y = by;
        breakoutCtx.beginPath();
        breakoutCtx.rect(bx, by, brickWidth, brickHeight);
        breakoutCtx.fillStyle = bricks[c][r].color;
        breakoutCtx.fill();
        breakoutCtx.closePath();
      }
    }
  }

  breakoutCtx.beginPath();
  breakoutCtx.arc(bX, bY, ballRadius, 0, Math.PI * 2);
  breakoutCtx.fillStyle = "#ffffff";
  breakoutCtx.fill();
  breakoutCtx.closePath();

  breakoutCtx.beginPath();
  breakoutCtx.rect(paddleX, breakoutCanvas.height - paddleHeight, paddleWidth, paddleHeight);
  breakoutCtx.fillStyle = "#39c2d7";
  breakoutCtx.fill();
  breakoutCtx.closePath();

  breakoutCtx.font = "bold 14px sans-serif";
  breakoutCtx.fillStyle = "#f2427a";
  breakoutCtx.fillText("SCORE: " + breakoutScore, 15, 25);

  for (let c = 0; c < colCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (bX > b.x && bX < b.x + brickWidth && bY > b.y && bY < b.y + brickHeight) {
          bDy = -bDy;
          b.status = 0;
          breakoutScore += 10;
        }
      }
    }
  }

  if (bX + bDx > breakoutCanvas.width - ballRadius || bX + bDx < ballRadius) bDx = -bDx;
  if (bY + bDy < ballRadius) bDy = -bDy;
  else if (bY + bDy > breakoutCanvas.height - ballRadius) {
    if (bX > paddleX && bX < paddleX + paddleWidth) {
      bDy = -bDy;
    } else {
      initBreakout();
      return;
    }
  }

  if (rightPressed && paddleX < breakoutCanvas.width - paddleWidth) paddleX += paddleSpeed;
  else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  bX += bDx; bY += bDy;
  breakoutAnimationFrame = requestAnimationFrame(drawBreakout);
}

/* 2. JOGO DO PAC-MAN*/
let pacCanvas, pacCtx;
let pacX, pacY;
let pacDir = 0, nextPacDir = 0;
let pacSpeed = 1.5;
let pacScore = 0;
let pacLives = 3;
let pacAnimationFrame;

const tileSize = 20;

const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,2,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let ghosts = [];

function resetPositions() {
  pacX = 9 * tileSize + 10;
  pacY = 16 * tileSize + 10;
  pacDir = 0;
  nextPacDir = 0;

  ghosts = [
    { x: 9 * tileSize + 10, y: 8 * tileSize + 10, color: "#ff0000", dir: 0 },
    { x: 9 * tileSize + 10, y: 9 * tileSize + 10, color: "#ffb8ff", dir: 3 },
    { x: 8 * tileSize + 10, y: 10 * tileSize + 10, color: "#00ffff", dir: 3 },
    { x: 10 * tileSize + 10, y: 10 * tileSize + 10, color: "#ffb852", dir: 3 }
  ];
}

function initPacman() {
  pacCanvas = document.getElementById("pacmanCanvas");
  pacCtx = pacCanvas.getContext("2d");

  pacScore = 0;
  pacLives = 3;
  resetPositions();

  if (pacAnimationFrame) cancelAnimationFrame(pacAnimationFrame);
  drawPacman();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextPacDir = 0;
  if (e.key === "ArrowDown") nextPacDir = 1;
  if (e.key === "ArrowLeft") nextPacDir = 2;
  if (e.key === "ArrowUp") nextPacDir = 3;
});

let touchStartX = 0, touchStartY = 0;
document.addEventListener("DOMContentLoaded", () => {
  const pCanvas = document.getElementById("pacmanCanvas");
  if (pCanvas) {
    pCanvas.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    pCanvas.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        nextPacDir = diffX > 0 ? 0 : 2;
      } else {
        nextPacDir = diffY > 0 ? 1 : 3;
      }
    }, { passive: true });
  }
});

function canMoveTile(posX, posY, dir) {
  let speed = pacSpeed;
  let newX = posX;
  let newY = posY;

  if (dir === 0) newX += speed;
  if (dir === 1) newY += speed;
  if (dir === 2) newX -= speed;
  if (dir === 3) newY -= speed;

  const r = 7;
  const points = [
    { x: newX - r, y: newY - r },
    { x: newX + r, y: newY - r },
    { x: newX - r, y: newY + r },
    { x: newX + r, y: newY + r }
  ];

  for (let pt of points) {
    let c = Math.floor(pt.x / tileSize);
    let r = Math.floor(pt.y / tileSize);
    if (map[r] && map[r][c] === 1) return false;
  }
  return true;
}

function drawPacman() {
  pacCtx.fillStyle = "#1a181e";
  pacCtx.fillRect(0, 0, pacCanvas.width, pacCanvas.height);

  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 1) {
        pacCtx.fillStyle = "#39c2d7";
        pacCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      } else if (map[r][c] === 2) {
        pacCtx.beginPath();
        pacCtx.arc(c * tileSize + 10, r * tileSize + 10, 3, 0, Math.PI * 2);
        pacCtx.fillStyle = "#f8c257";
        pacCtx.fill();
        pacCtx.closePath();
      }
    }
  }

  if (canMoveTile(pacX, pacY, nextPacDir)) {
    if (nextPacDir === 0 || nextPacDir === 2) {
      let tileY = Math.floor(pacY / tileSize) * tileSize + 10;
      if (Math.abs(pacY - tileY) < 6) pacY = tileY;
    } else if (nextPacDir === 1 || nextPacDir === 3) {
      let tileX = Math.floor(pacX / tileSize) * tileSize + 10;
      if (Math.abs(pacX - tileX) < 6) pacX = tileX;
    }
    if (canMoveTile(pacX, pacY, nextPacDir)) {
      pacDir = nextPacDir;
    }
  }

  if (canMoveTile(pacX, pacY, pacDir)) {
    if (pacDir === 0) pacX += pacSpeed;
    if (pacDir === 1) pacY += pacSpeed;
    if (pacDir === 2) pacX -= pacSpeed;
    if (pacDir === 3) pacY -= pacSpeed;
  }

  const currentTileC = Math.floor(pacX / tileSize);
  const currentTileR = Math.floor(pacY / tileSize);
  if (map[currentTileR] && map[currentTileR][currentTileC] === 2) {
    map[currentTileR][currentTileC] = 0;
    pacScore += 10;
  }

  pacCtx.beginPath();
  let startAngle = 0.2 * Math.PI + (pacDir * 0.5 * Math.PI);
  let endAngle = 1.8 * Math.PI + (pacDir * 0.5 * Math.PI);
  pacCtx.arc(pacX, pacY, 8, startAngle, endAngle);
  pacCtx.lineTo(pacX, pacY);
  pacCtx.fillStyle = "#f8c257";
  pacCtx.fill();
  pacCtx.closePath();

  ghosts.forEach(ghost => {
    let ghostSpeed = 1;
    if (canMoveTile(ghost.x, ghost.y, ghost.dir)) {
      if (ghost.dir === 0) ghost.x += ghostSpeed;
      if (ghost.dir === 1) ghost.y += ghostSpeed;
      if (ghost.dir === 2) ghost.x -= ghostSpeed;
      if (ghost.dir === 3) ghost.y -= ghostSpeed;
    } else {
      let possibleDirs = [0, 1, 2, 3].filter(d => canMoveTile(ghost.x, ghost.y, d));
      if (possibleDirs.length > 0) {
        ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
      }
    }

    pacCtx.beginPath();
    pacCtx.arc(ghost.x, ghost.y - 1, 8, Math.PI, 0, false);
    pacCtx.rect(ghost.x - 8, ghost.y - 1, 16, 8);
    pacCtx.fillStyle = ghost.color;
    pacCtx.fill();
    pacCtx.closePath();

    pacCtx.beginPath();
    pacCtx.arc(ghost.x - 3, ghost.y - 2, 2.5, 0, Math.PI * 2);
    pacCtx.arc(ghost.x + 3, ghost.y - 2, 2.5, 0, Math.PI * 2);
    pacCtx.fillStyle = "#ffffff";
    pacCtx.fill();
    pacCtx.closePath();

    let dist = Math.hypot(pacX - ghost.x, pacY - ghost.y);
    if (dist < 12) {
      pacLives--;
      if (pacLives <= 0) {
        initPacman();
      } else {
        resetPositions();
      }
      return;
    }
  });

  pacCtx.font = "bold 14px sans-serif";
  pacCtx.fillStyle = "#ffffff";
  pacCtx.fillText("PONTOS: " + pacScore, 10, pacCanvas.height - 10);

  // Desenhar Vidas (Ícones)
  for (let i = 0; i < pacLives; i++) {
    pacCtx.beginPath();
    pacCtx.arc(pacCanvas.width - 20 - (i * 20), pacCanvas.height - 15, 6, 0.2 * Math.PI, 1.8 * Math.PI);
    pacCtx.lineTo(pacCanvas.width - 20 - (i * 20), pacCanvas.height - 15);
    pacCtx.fillStyle = "#f8c257";
    pacCtx.fill();
    pacCtx.closePath();
  }

  pacAnimationFrame = requestAnimationFrame(drawPacman);
}

window.onload = function() {
  initBreakout();
};
