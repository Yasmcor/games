const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Garante foco imediato na janela
window.focus();

let x = canvas.width / 2;
let y = canvas.height - 30;
let baseSpeed = 3;
let dx = baseSpeed;
let dy = -baseSpeed;

const ballRadius = 6;

// Configurações padrão da plataforma
const DEFAULT_PADDLE_WIDTH = 85;
const DEFAULT_PADDLE_SPEED = 7;

let paddleHeight = 12;
let paddleWidth = DEFAULT_PADDLE_WIDTH;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = DEFAULT_PADDLE_SPEED;

// Timers para controlar a duração dos bônus (6 segundos)
let expandTimeout = null;
let speedTimeout = null;

let rightPressed = false;
let leftPressed = false;

// Configuração de Blocos
const rowCount = 6;
const colCount = 9;
const brickWidth = 46;
const brickHeight = 14;
const brickPadding = 6;
const brickOffsetTop = 40;
const brickOffsetLeft = 18;

// Paleta inspirada na imagem (tons pastel / pixel art retrô)
const rowColors = [
  "#f2427a", // Rosa Chiclete
  "#fa7268", // Salmão / Coral
  "#f8c257", // Amarelo Pastel
  "#39c2d7", // Azul Turquesa
  "#9b51e0", // Roxo / Lilás
  "#2ad2a0"  // Verde Água
];

let score = 0;
let powerups = [];

const POWERUP_TYPES = {
  EXPAND: { color: "#39c2d7", label: "↔" },
  SPEED: { color: "#f8c257", label: "⚡" }
};

let bricks = [];

function initBricks() {
  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: rowColors[r % rowColors.length] };
    }
  }
}

initBricks();

// Eventos de teclado
window.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

function spawnPowerup(x, y) {
  if (Math.random() < 0.3) {
    const type = Math.random() > 0.5 ? POWERUP_TYPES.EXPAND : POWERUP_TYPES.SPEED;
    powerups.push({ x: x + brickWidth / 2, y: y, type: type, radius: 8 });
  }
}

function applyPowerup(type) {
  if (type === POWERUP_TYPES.EXPAND) {
    paddleWidth = 140;
    if (expandTimeout) clearTimeout(expandTimeout);
    expandTimeout = setTimeout(() => {
      paddleWidth = DEFAULT_PADDLE_WIDTH;
    }, 6000);
  } else if (type === POWERUP_TYPES.SPEED) {
    paddleSpeed = 12;
    if (speedTimeout) clearTimeout(speedTimeout);
    speedTimeout = setTimeout(() => {
      paddleSpeed = DEFAULT_PADDLE_SPEED;
    }, 6000);
  }
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.y += 2;

    if (p.y + p.radius >= canvas.height - paddleHeight && p.x >= paddleX && p.x <= paddleX + paddleWidth) {
      applyPowerup(p.type);
      powerups.splice(i, 1);
      continue;
    }

    if (p.y > canvas.height) {
      powerups.splice(i, 1);
    }
  }
}

function drawPowerups() {
  powerups.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.type.color;
    ctx.fill();
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.type.color;
    ctx.closePath();

    ctx.fillStyle = "#1e1e24";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.type.label, p.x, p.y);
    ctx.shadowBlur = 0;
  });
}

function resetGame() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = baseSpeed;
  dy = -baseSpeed;
  paddleWidth = DEFAULT_PADDLE_WIDTH;
  paddleSpeed = DEFAULT_PADDLE_SPEED;
  paddleX = (canvas.width - paddleWidth) / 2;
  score = 0;
  powerups = [];
  initBricks();
}

function collisionDetection() {
  for (let c = 0; c < colCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score += 10;
          spawnPowerup(b.x, b.y);

          if (score === rowCount * colCount * 10) {
            resetGame();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#ffffff";
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#39c2d7"; // Azul turquesa destacado
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#39c2d7";
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawBricks() {
  for (let c = 0; c < colCount; c++) {
    for (let r = 0; r < rowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = bricks[c][r].color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = bricks[c][r].color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function drawScore() {
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#f2427a"; // Rosa chiclete no placar
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + score, 15, 25);
}

function draw() {
  // Fundo num tom escuro quente (preto levemente acolhedor como na arte)
  ctx.fillStyle = "#1a181e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawPowerups();
  drawScore();
  
  collisionDetection();
  updatePowerups();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      resetGame();
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
  else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

draw();
