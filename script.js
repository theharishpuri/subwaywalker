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
   AUDIO (optional hooks)
===================== */
const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;

/* =====================
   UI
===================== */
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const highScoreText = document.getElementById("highScore");

/* =====================
   GAME STATE
===================== */
let gameRunning = false;
let paused = false;

let score = 0;
let coins = 0;
let lives = 3;

let speed = 7;

/* CAMERA SHAKE */
let shake = 0;

/* DAY/NIGHT CYCLE */
let time = 0;

/* ANIMATION */
let anim = 0;

/* HIGH SCORE */
let highScore = localStorage.getItem("hs") || 0;
highScoreText.innerText = highScore;

/* =====================
   LANES
===================== */
const laneW = 130;
let lane = 1;

/* =====================
   PLAYER
===================== */
const player = {
    x: laneW + 40,
    y: 500,
    w: 50,
    h: 80,
    vy: 0,
    jump: false,
    slide: false
};

/* =====================
   OBJECTS
===================== */
let obs = [];
let coinList = [];
let particles = [];

/* =====================
   SPAWN
===================== */
setInterval(() => {
    if (gameRunning) spawn();
}, 1400);

setInterval(() => {
    if (gameRunning) spawnCoin();
}, 1100);

function spawn() {
    let t = Math.random() < 0.5 ? "train" : "barrier";

    obs.push({
        t,
        x: Math.floor(Math.random() * 3) * laneW + 40,
        y: -120,
        w: 70,
        h: t === "train" ? 140 : 80
    });
}

function spawnCoin() {
    coinList.push({
        x: Math.floor(Math.random() * 3) * laneW + 50,
        y: -40,
        r: 15
    });
}

/* =====================
   CONTROLS
===================== */
function moveLeft() {
    if (lane > 0) {
        lane--;
        player.x = lane * laneW + 40;
    }
}

function moveRight() {
    if (lane < 2) {
        lane++;
        player.x = lane * laneW + 40;
    }
}

function jump() {
    if (!player.jump) {
        player.vy = -15;
        player.jump = true;
    }
}

function slide() {
    if (player.slide) return;
    player.slide = true;
    player.h = 40;

    setTimeout(() => {
        player.h = 80;
        player.slide = false;
    }, 600);
}

/* =====================
   KEYBOARD (FIXED)
===================== */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "ArrowUp") jump();
    if (e.key === "ArrowDown") slide();
    if (e.key === "p") paused = !paused;
});

/* =====================
   START
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
    document.getElementById("gameOverScreen").style.display = "flex";

    document.getElementById("finalScore").innerText = score;

    if (score > highScore) {
        localStorage.setItem("hs", score);
    }
}

/* =====================
   CAMERA SHAKE
===================== */
function addShake() {
    shake = 10;
}

/* =====================
   PARTICLES (COIN FX)
===================== */
function addParticle(x, y) {
    particles.push({
        x,
        y,
        vy: Math.random() * -2,
        life: 30
    });
}

/* =====================
   UPDATE
===================== */
function update() {
    if (!gameRunning || paused) return;

    time += 0.01;
    speed = Math.min(15, speed + 0.001);

    /* animation frame */
    anim += 0.2;

    /* physics */
    player.y += player.vy;
    player.vy += 0.8;

    if (player.y >= 500 && !player.slide) {
        player.y = 500;
        player.vy = 0;
        player.jump = false;
    }

    /* obstacles */
    for (let i = obs.length - 1; i >= 0; i--) {
        let o = obs[i];
        o.y += speed;

        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ) {
            lives--;
            livesText.innerText = lives;

            addShake();
            obs.splice(i, 1);

            if (lives <= 0) gameOver();
        }

        if (o.y > 700) {
            obs.splice(i, 1);
            score++;
            scoreText.innerText = score;
        }
    }

    /* coins */
    for (let i = coinList.length - 1; i >= 0; i--) {
        let c = coinList[i];
        c.y += speed;

        let dx = (player.x + 25) - c.x;
        let dy = (player.y + 40) - c.y;
        let d = Math.sqrt(dx * dx + dy * dy);

        if (d < 35) {
            coins++;
            coinsText.innerText = coins;

            addParticle(c.x, c.y);

            coinList.splice(i, 1);
        }

        if (c.y > 700) coinList.splice(i, 1);
    }

    /* particles */
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) particles.splice(i, 1);
    }

    if (shake > 0) shake--;
}

/* =====================
   DRAW (AAA POLISH)
===================== */
function draw() {

    let offsetX = 0;
    let offsetY = 0;

    if (shake > 0) {
        offsetX = (Math.random() - 0.5) * 10;
        offsetY = (Math.random() - 0.5) * 10;
    }

    ctx.save();
    ctx.translate(offsetX, offsetY);

    /* DAY/NIGHT SKY */
    let day = Math.sin(time) * 0.5 + 0.5;

    let sky = ctx.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, `rgb(${80 + day * 80}, ${180 + day * 50}, 255)`);
    sky.addColorStop(1, "#b3e5fc");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 400, 600);

    /* ROAD */
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 200, 400, 400);

    /* PLAYER (simple run animation feel) */
    let bounce = Math.sin(anim) * 2;

    ctx.drawImage(
        playerImg,
        player.x,
        player.y + bounce,
        player.w,
        player.h
    );

    /* OBSTACLES */
    obs.forEach(o => {
        ctx.drawImage(
            o.t === "train" ? trainImg : barrierImg,
            o.x,
            o.y,
            o.w,
            o.h
        );
    });

    /* COINS */
    coinList.forEach(c => {
        ctx.drawImage(coinImg, c.x - 15, c.y - 15, 30, 30);
    });

    /* PARTICLES */
    particles.forEach(p => {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
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
