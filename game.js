const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const state = {
  running: false,
  score: 0,
  lastShot: 0,
  lastSpawn: 0,
  difficulty: 1,
  player: {
    x: 0,
    y: 0,
    radius: 16,
    speed: 4,
    health: 100,
    angle: 0,
  },
  bullets: [],
  enemies: [],
  pressed: new Set(),
  mouse: { x: 0, y: 0, shooting: false },
};

const colors = {
  player: "#3fd1c2",
  bullet: "#9cf4e9",
  enemy: "#ff7b5f",
  hp: "#f2ce5a",
};

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function resetGame() {
  state.score = 0;
  state.lastShot = 0;
  state.lastSpawn = 0;
  state.difficulty = 1;
  state.player.x = canvas.width / 2;
  state.player.y = canvas.height / 2;
  state.player.health = 100;
  state.bullets = [];
  state.enemies = [];
  scoreEl.textContent = `得分：${state.score}`;
  healthEl.textContent = `生命：${Math.round(state.player.health)}%`;
}

function startGame() {
  resetGame();
  overlay.classList.add("hidden");
  state.running = true;
}

function stopGame() {
  state.running = false;
  overlay.querySelector("h1").textContent = "游戏结束";
  overlay.querySelector("p").textContent = `你的得分：${state.score}`;
  startBtn.textContent = "再来一次";
  overlay.classList.remove("hidden");
}

function spawnEnemy(delta) {
  state.lastSpawn += delta;
  const spawnRate = Math.max(600 - state.difficulty * 25, 200);
  if (state.lastSpawn < spawnRate) return;
  state.lastSpawn = 0;
  state.difficulty += 0.02;

  const edge = Math.floor(Math.random() * 4);
  const offset = Math.random();
  const speed = 1.5 + Math.random() * state.difficulty * 0.25;
  const radius = 14 + Math.random() * 6;
  let x, y;

  switch (edge) {
    case 0:
      x = offset * canvas.width;
      y = -radius;
      break;
    case 1:
      x = canvas.width + radius;
      y = offset * canvas.height;
      break;
    case 2:
      x = offset * canvas.width;
      y = canvas.height + radius;
      break;
    default:
      x = -radius;
      y = offset * canvas.height;
  }

  state.enemies.push({ x, y, radius, speed });
}

function handleInput() {
  const velocity = { x: 0, y: 0 };
  if (state.pressed.has("w") || state.pressed.has("arrowup")) velocity.y -= 1;
  if (state.pressed.has("s") || state.pressed.has("arrowdown")) velocity.y += 1;
  if (state.pressed.has("a") || state.pressed.has("arrowleft")) velocity.x -= 1;
  if (state.pressed.has("d") || state.pressed.has("arrowright")) velocity.x += 1;

  const length = Math.hypot(velocity.x, velocity.y) || 1;
  state.player.x = Math.min(
    Math.max(state.player.radius, state.player.x + (velocity.x / length) * state.player.speed),
    canvas.width - state.player.radius
  );
  state.player.y = Math.min(
    Math.max(state.player.radius, state.player.y + (velocity.y / length) * state.player.speed),
    canvas.height - state.player.radius
  );

  const dx = state.mouse.x - state.player.x;
  const dy = state.mouse.y - state.player.y;
  state.player.angle = Math.atan2(dy, dx);

  if (state.mouse.shooting || state.pressed.has(" ")) {
    shoot();
  }
}

function shoot() {
  const now = performance.now();
  if (now - state.lastShot < 200) return;
  state.lastShot = now;

  const speed = 8;
  const vx = Math.cos(state.player.angle) * speed;
  const vy = Math.sin(state.player.angle) * speed;
  state.bullets.push({
    x: state.player.x,
    y: state.player.y,
    radius: 6,
    vx,
    vy,
    life: 0,
  });
}

function update(delta) {
  handleInput();
  spawnEnemy(delta);

  state.bullets.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
    b.life += delta;
  });
  state.bullets = state.bullets.filter(
    (b) => b.life < 1500 && b.x > -20 && b.x < canvas.width + 20 && b.y > -20 && b.y < canvas.height + 20
  );

  state.enemies.forEach((e) => {
    const dx = state.player.x - e.x;
    const dy = state.player.y - e.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = e.speed;
    e.x += (dx / len) * speed;
    e.y += (dy / len) * speed;
  });

  // Bullet/enemy collisions
  state.enemies = state.enemies.filter((e) => {
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      const dist = Math.hypot(b.x - e.x, b.y - e.y);
      if (dist < b.radius + e.radius) {
        state.bullets.splice(i, 1);
        state.score += 100;
        scoreEl.textContent = `得分：${state.score}`;
        return false;
      }
    }
    return true;
  });

  // Enemy/player collisions
  state.enemies.forEach((e) => {
    const dist = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (dist < e.radius + state.player.radius) {
      state.player.health -= 20 * delta * 0.001;
      healthEl.textContent = `生命：${Math.max(0, Math.round(state.player.health))}%`;
      if (state.player.health <= 0) {
        stopGame();
      }
    }
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(state.player.x, state.player.y);
  ctx.rotate(state.player.angle);
  ctx.fillStyle = colors.player;
  ctx.beginPath();
  ctx.moveTo(state.player.radius + 4, 0);
  ctx.lineTo(-state.player.radius, -state.player.radius / 1.2);
  ctx.lineTo(-state.player.radius, state.player.radius / 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = colors.bullet;
  state.bullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies() {
  ctx.fillStyle = colors.enemy;
  state.enemies.forEach((e) => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBackground() {
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < 80; i++) {
    ctx.fillRect((i * 37) % canvas.width, (i * 71) % canvas.height, 2, 2);
  }
}

let lastTime = 0;
function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (state.running) {
    update(delta);
  }

  drawEnemies();
  drawBullets();
  drawPlayer();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = e.clientX - rect.left;
  state.mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
  state.mouse.shooting = true;
});

canvas.addEventListener("mouseup", () => {
  state.mouse.shooting = false;
});

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = touch.clientX - rect.left;
  state.mouse.y = touch.clientY - rect.top;
  state.mouse.shooting = true;
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = touch.clientX - rect.left;
  state.mouse.y = touch.clientY - rect.top;
});

canvas.addEventListener("touchend", () => {
  state.mouse.shooting = false;
});

window.addEventListener("keydown", (e) => {
  state.pressed.add(e.key.toLowerCase());
  if (e.key === " ") {
    state.mouse.shooting = true;
  }
});

window.addEventListener("keyup", (e) => {
  state.pressed.delete(e.key.toLowerCase());
  if (e.key === " ") {
    state.mouse.shooting = false;
  }
});

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", () => {
  startGame();
});

resetGame();
overlay.classList.remove("hidden");
