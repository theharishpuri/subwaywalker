const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =====================
   IMAGES
===================== */
const playerImg = new Image();
playerImg.src = "assets/player.png";

const trainImg = new Image();
trainImg.src = "assets/train.png";

const barrierImg = new Image();
barrierImg.src = "assets/barrier.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

/* =====================
   SOUND
===================== */
const bgMusic = new Audio("assets/sounds/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

/* =====================
   UI
===================== */
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");
const livesText = document.getElementById("lives");

/* =====================
   GAME STATE
===================== */
let gameRunning = false;
let paused = false;

let score = 0;
let coins = 0;
let lives = 3;

let speed = 7;

let highScore = localStorage.getItem("highscore") || 0;
highScoreText.innerText = highScore;

/* =====================
   LANES
===================== */
const laneWidth = 130;
let lane = 1;

/* =====================
   PLAYER
===================== */
const player = {
    x: laneWidth + 40,
    y: 500,
    width: 50,
    height: 80,
    velocityY: 0,
    jumping: false,
    sliding: false,
    normalHeight: 80,
    slideHeight: 40
};

/* =====================
   OBJECTS
===================== */
let obstacles = [];
let coinList = [];

/* =====================
   BACKGROUND
===================== */
let bg1 = 0;
let bg2 = 0;

/* =====================
   SPAWN
===================== */
function createObstacle() {
    let type = Math.random() < 0.5 ? "train" : "barrier";

    obstacles.push({
        type,
        x: Math.floor(Math.random() * 3) * laneWidth + 40,
        y: -120,
        width: 70,
        height: type === "train" ? 140 : 80
    });
}

function createCoin() {
    coinList.push({
        x: Math.floor(Math.random() * 3) * laneWidth + 55,
        y: -50,
        radius: 15
    });
}

/* =====================
   INTERVALS
===================== */
setInterval(() => {
    if (gameRunning) createObstacle();
}, 1500);

setInterval(() => {
    if (gameRunning) createCoin();
}, 1200);

/* =====================
   CONTROLS
===================== */
function moveLeft() {
    if (lane > 0) {
        lane--;
        player.x = lane * laneWidth + 40;
    }
}

function moveRight() {
    if (lane < 2) {
        lane++;
        player.x = lane * laneWidth + 40;
    }
}

function jump() {
    if (!player.jumping) {
        player.velocityY = -15;
        player.jumping = true;
    }
}

function slide() {
    if (player.sliding) return;

    player.sliding = true;
    player.height = player.slideHeight;
    player.y = 540;

    setTimeout(() => {
        player.height = player.normalHeight;
        player.y = 500;
        player.sliding = false;
    }, 700);
}

/* =====================
   KEYBOARD + SWIPE
===================== */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") jump();
    if (e.key === "ArrowDown") slide();
    if (e.key === "p") togglePause();
});

/* swipe */
let startX = 0;

document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
    let diff = e.changedTouches[0].clientX - startX;

    if (Math.abs(diff) > 40) {
        diff > 0 ? moveRight() : moveLeft();
    } else {
        jump();
    }
});

/* =====================
   PAUSE
===================== */
function togglePause() {
    paused = !paused;
}

/* =====================
   START GAME
===================== */
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    gameRunning = true;

    bgMusic.play();
};

/* =====================
   GAME OVER
===================== */
function gameOver() {
    gameRunning = false;

    bgMusic.pause();

    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";

    document.getElementById("finalScore").innerText = score;

    if (score > highScore) {
        localStorage.setItem("highscore", score);
    }
}

function restartGame() {
    location.reload();
}

/* =====================
   UPDATE
===================== */
function update() {

    if (!gameRunning || paused) return;

    speed += 0.0008;

    /* physics */
    player.y += player.velocityY;
    player.velocityY += 0.8;

    if (player.y >= 500 && !player.sliding) {
        player.y = 500;
        player.velocityY = 0;
        player.jumping = false;
    }

    /* obstacles */
    obstacles.forEach(obs => {
        obs.y += speed;

        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            lives--;
            livesText.innerText = lives;

            obs.y = 700;

            if (lives <= 0) gameOver();
        }

        if (obs.y > 650) {
            score++;
            scoreText.innerText = score;
        }
    });

    /* coins */
    coinList.forEach(c => {
        c.y += speed;

        let dx = (player.x + 25) - c.x;
        let dy = (player.y + 40) - c.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {
            coins++;
            coinsText.innerText = coins;
            c.y = 700;
        }
    });
}

/* =====================
   DRAW
===================== */
function draw() {

    ctx.clearRect(0, 0, 400, 600);

    /* parallax bg */
    bg1 -= speed * 0.2;
    bg2 -= speed * 0.5;

    let grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, "#4fc3ff");
    grad.addColorStop(1, "#b3e5fc");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 600);

    /* buildings layer 1 */
    ctx.fillStyle = "#455a64";
    for (let i = 0; i < 6; i++) {
        let x = (i * 90 + bg1) % 500;
        ctx.fillRect(x, 120, 60, 200);
    }

    /* buildings layer 2 */
    ctx.fillStyle = "#263238";
    for (let i = 0; i < 6; i++) {
        let x = (i * 120 + bg2) % 600;
        ctx.fillRect(x, 150, 80, 250);
    }

    /* road */
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 200, 400, 400);

    /* lanes */
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    for (let y = -40; y < 600; y += 60) {
        ctx.beginPath();
        ctx.moveTo(130, y);
        ctx.lineTo(130, y + 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(260, y);
        ctx.lineTo(260, y + 30);
        ctx.stroke();
    }

    /* player */
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    /* obstacles */
    obstacles.forEach(obs => {
        if (obs.type === "train") {
            ctx.drawImage(trainImg, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.drawImage(barrierImg, obs.x, obs.y, obs.width, obs.height);
        }
    });

    /* coins */
    coinList.forEach(c => {
        ctx.drawImage(coinImg, c.x - 15, c.y - 15, 30, 30);
    });
}

/* =====================
   LOOP
===================== */
function loop() {
    requestAnimationFrame(loop);
    if (!gameRunning || paused) return;
    update();
    draw();
}

loop();
