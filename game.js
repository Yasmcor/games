const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Foco automático para usar as setas imediatamente sem precisar clicar
canvas.focus();

let x = canvas.width / 2;
let y = canvas.height - 30;
let baseSpeed = 3;
let dx = baseSpeed;
let dy = -baseSpeed;

const ballRadius = 6;
let paddleHeight = 12;
let paddleWidth = 85;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 7;

let rightPressed = false;
let leftPressed = false;

// Configuração de Blocos (Menores e mais quantidade)
const rowCount = 6;
const colCount = 9;
const brickWidth = 46;
const brickHeight = 14;
const brickPadding = 6;
const brickOffsetTop = 40;
const brickOffsetLeft = 18;

// Cores no estilo da imagem (Tetris/Neon)
const rowColors = ["#ff2a75", "#ff7b00", "#ffea00", "#00e5ff", "#b537f2", "#ff0055"];

let score = 0;
let powerups = [];

// Lista de tipos de bônus
const POWERUP_TYPES = {
  EXPAND: { color: "#00e5ff", label: "↔" }, // Aumenta a plataforma
  SPEED: { color: "#ffea00", label: "⚡" }   // Aumenta velocidade do movimento
};

const bricks = [];
for (let c = 0; c < colCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < rowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, color: rowColors[r % rowColors.length] };
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

function spawnPowerup(x, y) {
  // 25% de chance de soltar um power-up
  if (Math.random() < 0.25) {
    const type = Math.random() > 0.5 ? POWERUP_TYPES.EXPAND : POWERUP_TYPES.SPEED;
    powerups.push({ x: x + brickWidth / 2, y: y, type: type, radius: 8 });
  }
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.y += 2;

    // Colisão com a plataforma
    if (p.y + p.radius >= canvas.height - paddleHeight && p.x >= paddleX && p.x <= paddleX + paddleWidth) {
      if (p.type === POWERUP_TYPES.EXPAND) {
        paddleWidth = Math.min(paddleWidth + 25, 160);
      } else if (p.type === POWERUP_TYPES.SPEED) {
        paddleSpeed += 2;
      }
      powerups.splice(i, 1);
      continue;
    }

    // Remove se cair fora da tela
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
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.type.color;
    ctx.closePath();

    ctx.fillStyle = "#000";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.type.label, p.x, p.y);
    ctx.shadowBlur = 0; // Reseta sombra
  });
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
            alert("Parabéns, você venceu!");
            document.location.reload();
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
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#ffffff";
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight, 6);
  ctx.fillStyle = "#00e5ff";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#00e5ff";
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
        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
        ctx.fillStyle = bricks[c][r].color;
        ctx.shadowBlur = 6;
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
  ctx.fillStyle = "#ff2a75";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + score, 15, 25);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
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
      alert("Fim de Jogo!");
      document.location.reload();
      return;
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
  else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

draw();
