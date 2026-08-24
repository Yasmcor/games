/* =========================================================
   1. JOGO DE BLOCOS (BREAKOUT)
   ========================================================= */
let breakoutCanvas, breakoutCtx;
let bX, bY, bDx, bDy;
const ballRadius = 6;
const DEFAULT_PADDLE_WIDTH = 85;
const DEFAULT_PADDLE_SPEED = 7;
let paddleHeight = 12, paddleWidth, paddleX, paddleSpeed;
let rightPressed = false, leftPressed = false;

const rowCount = 6, colCount = 9;
const brickWidth = 46, brickHeight = 14, brickPadding = 6;
const brickOffsetTop = 40, brickOffsetLeft = 18;
const rowColors = ["#f2427a", "#fa7268", "#f8c257", "#39c2d7", "#9b51e0", "#2ad2a0"];

let breakoutScore = 0, bricks = [];
let breakoutAnimationFrame = null;

function initBreakout() {
  if (breakoutAnimationFrame) cancelAnimationFrame(breakoutAnimationFrame);
  if (pacAnimationFrame) cancelAnimationFrame(pacAnimationFrame);

  breakoutCanvas = document.getElementById("myCanvas");
  if (!breakoutCanvas) return;
  breakoutCtx = breakoutCanvas.getContext("2d");

  bX = breakoutCanvas.width / 2;
  bY = breakoutCanvas.height - 30;
  bDx = 3; bDy = -3;
  paddleWidth = DEFAULT_PADDLE_WIDTH;
  paddleSpeed = DEFAULT_PADDLE_SPEED;
  paddleX = (breakoutCanvas.width - paddleWidth) / 2;
  breakoutScore = 0;

  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: rowColors[r % rowColors.length] };
    }
  }

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

/* =========================================================
   2. JOGO DO PAC-MAN
   ========================================================= */
let pacCanvas, pacCtx;
let pacX, pacY;
let pacDir = 0, nextPacDir = 0;
let pacSpeed = 1.5;
let pacScore = 0;
let pacLives = 3;
let isGameOver = false;
let pacAnimationFrame = null;

const tileSize = 20;

const initialMap = [
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

let map = [];
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
  if (pacAnimationFrame) cancelAnimationFrame(pacAnimationFrame);
  if (breakoutAnimationFrame) cancelAnimationFrame(breakoutAnimationFrame);

  pacCanvas = document.getElementById("pacmanCanvas");
  if (!pacCanvas) return;
  pacCtx = pacCanvas.getContext("2d");

  map = JSON.parse(JSON.stringify(initialMap));
  pacScore = 0;
  pacLives = 3;
  isGameOver = false;

  resetPositions();
  drawPacman();
}

window.addEventListener("keydown", (e) => {
  if (isGameOver && e.key === "Enter") {
    initPacman();
    return;
  }
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
      if (isGameOver) {
        initPacman();
        return;
      }
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

  if (!isGameOver) {
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
    if (!isGameOver) {
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

    if (!isGameOver) {
      let dist = Math.hypot(pacX - ghost.x, pacY - ghost.y);
      if (dist < 12) {
        pacLives--;
        if (pacLives <= 0) {
          isGameOver = true;
        } else {
          resetPositions();
        }
      }
    }
  });

  pacCtx.font = "bold 14px sans-serif";
  pacCtx.fillStyle = "#ffffff";
  pacCtx.fillText("PONTOS: " + pacScore, 10, pacCanvas.height - 10);

  for (let i = 0; i < pacLives; i++) {
    pacCtx.beginPath();
    pacCtx.arc(pacCanvas.width - 20 - (i * 20), pacCanvas.height - 15, 6, 0.2 * Math.PI, 1.8 * Math.PI);
    pacCtx.lineTo(pacCanvas.width - 20 - (i * 20), pacCanvas.height - 15);
    pacCtx.fillStyle = "#f8c257";
    pacCtx.fill();
    pacCtx.closePath();
  }

  if (isGameOver) {
    pacCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
    pacCtx.fillRect(0, 0, pacCanvas.width, pacCanvas.height);

    pacCtx.font = "bold 24px sans-serif";
    pacCtx.fillStyle = "#f2427a";
    pacCtx.textAlign = "center";
    pacCtx.fillText("GAME OVER", pacCanvas.width / 2, pacCanvas.height / 2 - 10);

    pacCtx.font = "12px sans-serif";
    pacCtx.fillStyle = "#ffffff";
    pacCtx.fillText("Toque na tela ou aperte ENTER para reiniciar", pacCanvas.width / 2, pacCanvas.height / 2 + 20);
    pacCtx.textAlign = "left";
  }

  pacAnimationFrame = requestAnimationFrame(drawPacman);
}

/* =========================================================
   3. JOGO DE SUDOKU (4x4)
   ========================================================= */
let sudokuCanvas, sudokuCtx;
let sudokuGrid = [
  [1, 0, 0, 4],
  [0, 0, 3, 0],
  [0, 3, 0, 0],
  [2, 0, 0, 1]
];
const sudokuSolution = [
  [1, 2, 3, 4],
  [4, 1, 3, 2],
  [3, 3, 1, 2],
  [2, 4, 2, 1]
]; // Exemplo de referência para validação simplificada
let initialSudoku = [
  [1, 0, 0, 4],
  [0, 0, 3, 0],
  [0, 3, 0, 0],
  [2, 0, 0, 1]
];
let selectedRow = -1, selectedCol = -1;
const sudokuTileSize = 70;
const sudokuOffsetX = 50, sudokuOffsetY = 30;

function initSudoku() {
  sudokuCanvas = document.getElementById("sudokuCanvas");
  if (!sudokuCanvas) return;
  sudokuCtx = sudokuCanvas.getContext("2d");

  sudokuGrid = JSON.parse(JSON.stringify(initialSudoku));
  selectedRow = -1;
  selectedCol = -1;

  drawSudoku();
}

document.addEventListener("DOMContentLoaded", () => {
  const sCanvas = document.getElementById("sudokuCanvas");
  if (sCanvas) {
    sCanvas.addEventListener("click", (e) => {
      const rect = sCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let col = Math.floor((x - sudokuOffsetX) / sudokuTileSize);
      let row = Math.floor((y - sudokuOffsetY) / sudokuTileSize);

      if (row >= 0 && row < 4 && col >= 0 && col < 4) {
        if (initialSudoku[row][col] === 0) {
          selectedRow = row;
          selectedCol = col;
        }
      } else if (y > 330 && y < 380 && selectedRow !== -1 && selectedCol !== -1) {
        let numClicked = Math.floor((x - sudokuOffsetX) / 60) + 1;
        if (numClicked >= 1 && numClicked <= 4) {
          sudokuGrid[selectedRow][selectedCol] = numClicked;
        }
      }
      drawSudoku();
    });
  }
});

function drawSudoku() {
  if (!sudokuCtx) return;
  sudokuCtx.fillStyle = "#1a181e";
  sudokuCtx.fillRect(0, 0, sudokuCanvas.width, sudokuCanvas.height);

  // Desenhar Células
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let x = sudokuOffsetX + c * sudokuTileSize;
      let y = sudokuOffsetY + r * sudokuTileSize;

      if (r === selectedRow && c === selectedCol) {
        sudokuCtx.fillStyle = "#39c2d7";
      } else if (initialSudoku[r][c] !== 0) {
        sudokuCtx.fillStyle = "#2ad2a0";
      } else {
        sudokuCtx.fillStyle = "#2a2633";
      }

      sudokuCtx.fillRect(x, y, sudokuTileSize - 2, sudokuTileSize - 2);

      if (sudokuGrid[r][c] !== 0) {
        sudokuCtx.font = "bold 24px sans-serif";
        sudokuCtx.fillStyle = initialSudoku[r][c] !== 0 ? "#ffffff" : "#f8c257";
        sudokuCtx.textAlign = "center";
        sudokuCtx.fillText(sudokuGrid[r][c], x + sudokuTileSize / 2 - 1, y + sudokuTileSize / 2 + 8);
        sudokuCtx.textAlign = "left";
      }
    }
  }

  // Linhas do Grid / Regiões 2x2
  sudokuCtx.strokeStyle = "#ffffff";
  sudokuCtx.lineWidth = 3;
  sudokuCtx.beginPath();
  sudokuCtx.moveTo(sudokuOffsetX + 2 * sudokuTileSize - 1, sudokuOffsetY);
  sudokuCtx.lineTo(sudokuOffsetX + 2 * sudokuTileSize - 1, sudokuOffsetY + 4 * sudokuTileSize);
  sudokuCtx.moveTo(sudokuOffsetX, sudokuOffsetY + 2 * sudokuTileSize - 1);
  sudokuCtx.lineTo(sudokuOffsetX + 4 * sudokuTileSize, sudokuOffsetY + 2 * sudokuTileSize - 1);
  sudokuCtx.stroke();

  // Botoes numéricos (1 a 4)
  for (let i = 1; i <= 4; i++) {
    let bx = sudokuOffsetX + (i - 1) * 60;
    let by = 330;

    sudokuCtx.fillStyle = "#fa7268";
    sudokuCtx.fillRect(bx, by, 50, 40);

    sudokuCtx.font = "bold 20px sans-serif";
    sudokuCtx.fillStyle = "#ffffff";
    sudokuCtx.textAlign = "center";
    sudokuCtx.fillText(i, bx + 25, by + 27);
    sudokuCtx.textAlign = "left";
  }
}

window.onload = function() {
  initBreakout();
  initSudoku();
};
