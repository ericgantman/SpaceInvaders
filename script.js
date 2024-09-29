// Game settings
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
};

let bullets = [];
let invaderBullets = [];
let invaders = [];
const invaderRowCount = 5;
const invaderColumnCount = 10;
const bulletSpeed = 7;
const invaderBulletSpeed = 4;
let isGameOver = false;
let isGameStarted = false;
let score = 0;
let lastShotTime = 0;
const shootCooldown = 500;
const invaderShootInterval = 2000;
let invaderGroupDx = 1; // Group movement speed
let invaderGroupDy = 0;
const invaderGroupMoveDownDistance = 20;
const invaderSpeed = 1;

const playerImage = new Image();
playerImage.src = "./images/LaserCannon.png";

const invaderImage = new Image();
invaderImage.src = "./images/SpaceInvader.png";

// Reset the game state
function resetGame() {
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 60;
  bullets = [];
  invaderBullets = [];
  invaders = [];
  score = 0;
  isGameOver = false;
  invaderGroupDx = 1; // Reset invader movement direction
  createInvaders(); // Generate new invaders
}

// Player Movement
function movePlayer() {
  player.x += player.dx;

  // Wall collision detection
  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

// Player shooting bullets (with cooldown)
function shootBullet() {
  const now = Date.now();
  if (now - lastShotTime > shootCooldown) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      dy: bulletSpeed,
    });
    lastShotTime = now;
  }
}

// Update bullets
function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.dy;

    if (bullet.y + bullet.height < 0) {
      bullets.splice(index, 1);
    }

    invaders.forEach((invader, invIndex) => {
      if (
        bullet.x < invader.x + invader.width &&
        bullet.x + bullet.width > invader.x &&
        bullet.y < invader.y + invader.height &&
        bullet.y + bullet.height > invader.y
      ) {
        bullets.splice(index, 1);
        invaders.splice(invIndex, 1);
        score += 100;
      }
    });
  });

  if (invaders.length === 0) {
    createInvaders();
  }
}

// Create invaders
function createInvaders() {
  for (let r = 0; r < invaderRowCount; r++) {
    for (let c = 0; c < invaderColumnCount; c++) {
      invaders.push({
        x: 50 + c * 60,
        y: 30 + r * 60,
        width: 40,
        height: 40,
      });
    }
  }
}

// Invaders shoot bullets
function invadersShoot() {
  const randomInvaderIndex = Math.floor(Math.random() * invaders.length);
  const invader = invaders[randomInvaderIndex];
  invaderBullets.push({
    x: invader.x + invader.width / 2 - 2,
    y: invader.y + invader.height,
    width: 4,
    height: 10,
    dy: invaderBulletSpeed,
  });
}

// Update invader bullets
function updateInvaderBullets() {
  invaderBullets.forEach((bullet, index) => {
    bullet.y += bullet.dy;

    if (bullet.y > canvas.height) {
      invaderBullets.splice(index, 1);
    }

    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      isGameOver = true;
    }
  });
}

// Draw player
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Draw invader bullets
function drawInvaderBullets() {
  invaderBullets.forEach((bullet) => {
    ctx.fillStyle = "red";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// Draw invaders
function drawInvaders() {
  invaders.forEach((invader) => {
    ctx.drawImage(
      invaderImage,
      invader.x,
      invader.y,
      invader.width,
      invader.height
    );
  });
}

// Move invaders as a group
function moveInvaders() {
  // Find the leftmost and rightmost invader positions
  const leftmost = Math.min(...invaders.map((invader) => invader.x));
  const rightmost = Math.max(
    ...invaders.map((invader) => invader.x + invader.width)
  );

  // Check if the invader group hits the left or right edge of the canvas
  if (rightmost >= canvas.width || leftmost <= 0) {
    invaderGroupDx *= -1; // Reverse direction
    invaders.forEach((invader) => {
      invader.y += invaderGroupMoveDownDistance; // Move down
    });
  }

  // Move the invaders horizontally as a group
  invaders.forEach((invader) => {
    invader.x += invaderGroupDx * invaderSpeed;
  });

  // Check for game over if invaders reach the player's row
  invaders.forEach((invader) => {
    if (invader.y + invader.height >= player.y) {
      isGameOver = true;
    }
  });
}

// Draw the score
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);
}

// Show the start screen
function showStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "50px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    "SPACE INVADERS",
    canvas.width / 2 - 200,
    canvas.height / 2 - 50
  );
  ctx.font = "30px Arial";
  ctx.fillText(
    "Press Enter to Start",
    canvas.width / 2 - 150,
    canvas.height / 2 + 30
  );
}

// Show Game Over screen
function showGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "50px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(
    "Final Score: " + score,
    canvas.width / 2 - 100,
    canvas.height / 2 + 50
  );
  ctx.fillText(
    "Press Enter to Restart",
    canvas.width / 2 - 150,
    canvas.height / 2 + 100
  );
}

// Draw the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawInvaders();
  drawInvaderBullets();
  drawScore();
}

// Update game objects
function update() {
  if (isGameStarted) {
    if (!isGameOver) {
      movePlayer();
      updateBullets();
      moveInvaders();
      updateInvaderBullets();
      draw();
      requestAnimationFrame(update);
    } else {
      showGameOverScreen();
    }
  } else {
    showStartScreen();
  }
}

// Handle keyboard events
function keyDown(e) {
  if (isGameStarted && !isGameOver) {
    if (e.key === "ArrowRight" || e.key === "d") {
      player.dx = player.speed;
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      player.dx = -player.speed;
    } else if (e.key === " ") {
      shootBullet();
    }
  }

  // Start or restart the game
  if (e.key === "Enter") {
    if (!isGameStarted) {
      isGameStarted = true;
      resetGame();
      update();
    } else if (isGameOver) {
      resetGame();
      update();
    }
  }
}

function keyUp(e) {
  if (
    e.key === "ArrowRight" ||
    e.key === "d" ||
    e.key === "ArrowLeft" ||
    e.key === "a"
  ) {
    player.dx = 0;
  }
}

// Invaders shooting mechanism at regular intervals
setInterval(invadersShoot, invaderShootInterval);

// Event listeners for keyboard input
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Start the game loop
update();
