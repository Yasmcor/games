window.onload = function () {
  const canvas = document.getElementById("myCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let x = canvas.width / 2;
  let y = canvas.height - 30;
  let dx = 3;
  let dy = -3;
  const ballRadius = 6;

  const DEFAULT_PADDLE_WIDTH = 85;
  let paddleHeight = 12;
  let paddleWidth = DEFAULT_PADDLE_WIDTH;
  let paddleX = (canvas.width - paddleWidth) / 2;
  let paddleSpeed = 7;

  let rightPressed = false;
  let leftPressed = false;

  const rowCount = 6;
  const colCount = 9;
  const brickWidth = 46;
  const brickHeight = 14;
  const brickPadding = 6;
  const brickOffsetTop = 40;
  const brickOffsetLeft = 18;
  const rowColors = ["#ff2a75", "#ff7b00", "#ffea00", "#00e5ff", "#b537f2", "#ff0055"];

  let score = 0;
  const bricks = [];
  for (let c = 0; c < colCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, color: rowColors[r % rowColors.length] };
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  });

  function collisionDetection() {
    for (let c = 0; c < colCount; c++) {
      for (let r = 0; r < rowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
            b.status = 0;
            score += 10;
          }
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    // USANDO RECT PARA EVITAR ERRO DE NAVEGADOR
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00e5ff";
    ctx.fill();
    ctx.closePath();
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
          // USANDO RECT PARA EVITAR ERRO DE NAVEGADOR
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = bricks[c][r].color;
          ctx.fill();
          ctx.closePath();
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
    drawScore();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        // REINICIA A POSIÇÃO DA BOLA SEM TRAVAR A TELA
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 3;
        dy = -3;
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
  }

  draw();
};
