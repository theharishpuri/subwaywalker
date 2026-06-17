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
   SOUNDS
===================== */
const jumpSound = new Audio("assets/sounds/jump.mp3");
const coinSound = new Audio("assets/sounds/coin.mp3");
const hitSound = new Audio("assets/sounds/hit.mp3");
const gameOverSound = new Audio("assets/sounds/gameover.mp3");

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
let roadOffset = 0;

let highScore = localStorage.getItem("highscore") || 0;
highScoreText.innerText = highScore;

/* =====================
   POWER UPS
===================== */
let magnet = false;
let magnetTimer = 0;

let shield = false;
let shieldTimer = 0;

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
let powerups = [];

/* =====================
   SPAWN FUNCTIONS
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

function createPowerup() {
    let type = Math.random() < 0.5 ? "magnet" : "shield";

    powerups.push({
        type,
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

setInterval(() => {
    if (gameRunning) createPowerup();
}, 8000);

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
        jumpSound.play();
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
   KEYBOARD
===================== */
document.addEventListener("keydown", e => {

    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") jump();
    if (e.key === "ArrowDown") slide();

    if (e.key === "p" || e.key === "P") {
        paused = !paused;
    }

});

/* =====================
   START / GAME OVER
===================== */
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    gameRunning = true;
};

function gameOver() {
    gameRunning = false;

    gameOverSound.play();

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

    /* player physics */
    player.y += player.velocityY;
    player.velocityY += 0.8;

    if (player.y >= 500 && !player.sliding) {
        player.y = 500;
        player.velocityY = 0;
        player.jumping = false;
    }

    /* magnets/shield timers */
    if (magnet) {
        magnetTimer--;
        if (magnetTimer <= 0) magnet = false;
    }

    if (shield) {
        shieldTimer--;
        if (shieldTimer <= 0) shield = false;
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

            if (shield) {
                hitSound.play();
                obs.y = 700;
            } else {
                lives--;
                livesText.innerText = lives;
                hitSound.play();
                obs.y = 700;

                if (lives <= 0) gameOver();
            }
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

        if (magnet && dist < 200) {
            c.x += (player.x - c.x) * 0.1;
            c.y += (player.y - c.y) * 0.1;
        }

        if (dist < 40) {
            coins++;
            coinsText.innerText = coins;
            coinSound.play();
            c.y = 700;
        }
    });

    /* powerups */
    powerups.forEach(p => {

        p.y += speed;

        let dx = (player.x + 25) - p.x;
        let dy = (player.y + 40) - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 40) {

            if (p.type === "magnet") {
                magnet = true;
                magnetTimer = 500;
            }

            if (p.type === "shield") {
                shield = true;
                shieldTimer = 500;
            }

            p.y = 700;
        }
    });
}

/* =====================
   DRAW
===================== */
function draw() {

    ctx.clearRect(0, 0, 400, 600);

    roadOffset += speed;

    /* sky */
    ctx.fillStyle = "#64c8ff";
    ctx.fillRect(0, 0, 400, 200);

    /* buildings */
    ctx.fillStyle = "#555";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 80, 100, 60, 150);
    }

    /* road */
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 200, 400, 400);

    /* lanes */
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    for (let y = -40; y < 600; y += 60) {

        ctx.beginPath();
        ctx.moveTo(130, y + (roadOffset % 60));
        ctx.lineTo(130, y + 30 + (roadOffset % 60));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(260, y + (roadOffset % 60));
        ctx.lineTo(260, y + 30 + (roadOffset % 60));
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

    /* powerups */
    powerups.forEach(p => {
        ctx.fillStyle = p.type === "magnet" ? "purple" : "blue";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

/* =====================
   LOOP
===================== */
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
