/* =========================================================
   1. JOGO DE BLOCOS (BREAKOUT)
   ========================================================= */
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
  canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    paddleX = touchX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
    e.preventDefault();
  }, { passive: false });
});

function drawBreakout() {
  breakoutCtx.fillStyle = "#1a181e";
  breakoutCtx.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);

  // Desenhar Blocos
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

  // Bola
  breakoutCtx.beginPath();
  breakoutCtx.arc(bX, bY, ballRadius, 0, Math.PI * 2);
  breakoutCtx.fillStyle = "#ffffff";
  breakoutCtx.fill();
  breakoutCtx.closePath();

  // Raquete
  breakoutCtx.beginPath();
  breakoutCtx.rect(paddleX, breakoutCanvas.height - paddleHeight, paddleWidth, paddleHeight);
  breakoutCtx.fillStyle = "#39c2d7";
  breakoutCtx.fill();
  breakoutCtx.closePath();

  // Placar
  breakoutCtx.font = "bold 14px sans-serif";
  breakoutCtx.fillStyle = "#f2427a";
  breakoutCtx.fillText("SCORE: " + breakoutScore, 15, 25);

  // Colisões
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
let pacX = 190, pacY = 210;
let pacDir = 0, nextPacDir = 0; // 0: Direita, 1: Baixo, 2: Esquerda, 3: Cima
let pacSpeed = 2;
let pacScore = 0;
let pacAnimationFrame;

const tileSize = 20;
// 0: Vazio, 1: Parede, 2: Ponto
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
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
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

// Fantasma Básico
let ghostX = 190, ghostY = 170;
let ghostDir = 3;

function initPacman() {
  pacCanvas = document.getElementById("pacmanCanvas");
  pacCtx = pacCanvas.getContext("2d");

  pacX = 190; pacY = 330;
  ghostX = 190; ghostY = 170;
  pacScore = 0;

  if (pacAnimationFrame) cancelAnimationFrame(pacAnimationFrame);
  drawPacman();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextPacDir = 0;
  if (e.key === "ArrowDown") nextPacDir = 1;
  if (e.key === "ArrowLeft") nextPacDir = 2;
  if (e.key === "ArrowUp") nextPacDir = 3;
});

// Suporte a Toque na Tela no Celular para Pac-Man (Swipe)
let touchStartX = 0, touchStartY = 0;
document.addEventListener("DOMContentLoaded", () => {
  const pCanvas = document.getElementById("pacmanCanvas");
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
});

function canMove(x, y, dir) {
  let testX = x, testY = y;
  if (dir === 0) testX += pacSpeed;
  if (dir === 1) testY += pacSpeed;
  if (dir === 2) testX -= pacSpeed;
  if (dir === 3) testY -= pacSpeed;

  const tileX1 = Math.floor((testX - 8) / tileSize);
  const tileX2 = Math.floor((testX + 8) / tileSize);
  const tileY1 = Math.floor((testY - 8) / tileSize);
  const tileY2 = Math.floor((testY + 8) / tileSize);

  if (map[tileY1] && map[tileY1][tileX1] === 1) return false;
  if (map[tileY1] && map[tileY1][tileX2] === 1) return false;
  if (map[tileY2] && map[tileY2][tileX1] === 1) return false;
  if (map[tileY2] && map[tileY2][tileX2] === 1) return false;

  return true;
}

function drawPacman() {
  pacCtx.fillStyle = "#1a181e";
  pacCtx.fillRect(0, 0, pacCanvas.width, pacCanvas.height);

  // Desenha o Mapa
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

  // Mudança de Direção do Pacman
  if (canMove(pacX, pacY, nextPacDir)) pacDir = nextPacDir;
  if (canMove(pacX, pacY, pacDir)) {
    if (pacDir === 0) pacX += pacSpeed;
    if (pacDir === 1) pacY += pacSpeed;
    if (pacDir === 2) pacX -= pacSpeed;
    if (pacDir === 3) pacY -= pacSpeed;
  }

  // Coleta de Pontinhos
  const currentTileC = Math.floor(pacX / tileSize);
  const currentTileR = Math.floor(pacY / tileSize);
  if (map[currentTileR] && map[currentTileR][currentTileC] === 2) {
    map[currentTileR][currentTileC] = 0;
    pacScore += 10;
  }

  // Desenha Pac-Man
  pacCtx.beginPath();
  pacCtx.arc(pacX, pacY, 8, 0.2 * Math.PI, 1.8 * Math.PI);
  pacCtx.lineTo(pacX, pacY);
  pacCtx.fillStyle = "#f8c257";
  pacCtx.fill();
  pacCtx.closePath();

  // Movimento Fantasma Simples
  if (canMove(ghostX, ghostY, ghostDir)) {
    if (ghostDir === 0) ghostX += 1;
    if (ghostDir === 1) ghostY += 1;
    if (ghostDir === 2) ghostX -= 1;
    if (ghostDir === 3) ghostY -= 1;
  } else {
    ghostDir = Math.floor(Math.random() * 4);
  }

  // Desenha Fantasma
  pacCtx.beginPath();
  pacCtx.arc(ghostX, ghostY, 8, 0, Math.PI * 2);
  pacCtx.fillStyle = "#f2427a";
  pacCtx.fill();
  pacCtx.closePath();

  // Placar Pacman
  pacCtx.font = "bold 14px sans-serif";
  pacCtx.fillStyle = "#ffffff";
  pacCtx.fillText("PONTOS: " + pacScore, 10, pacCanvas.height - 10);

  pacAnimationFrame = requestAnimationFrame(drawPacman);
}

// Inicializa o primeiro jogo ao carregar a página
window.onload = function() {
  initBreakout();
};
