const jumpSound = new Audio("assets/sounds/jump.mp3");
const coinSound = new Audio("assets/sounds/coin.mp3");
const hitSound = new Audio("assets/sounds/hit.mp3");
const gameOverSound = new Audio("assets/sounds/gameover.mp3");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Images
const playerImg = new Image();
playerImg.src = "assets/player.png";

const trainImg = new Image();
trainImg.src = "assets/train.png";

const barrierImg = new Image();
barrierImg.src = "assets/barrier.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

// HUD
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");
const livesText = document.getElementById("lives");

// Variables
let score = 0;
let coins = 0;
let lives = 3;
let speed = 7;
let roadOffset = 0;
let gameRunning = false;

let highScore = localStorage.getItem("highscore") || 0;
highScoreText.innerText = highScore;

// Lanes
const laneWidth = 130;
let lane = 1;

// Player
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

// Arrays
let obstacles = [];
let coinList = [];

// Create obstacle
function createObstacle() {

    let type = Math.random() < 0.5 ? "train" : "barrier";

    obstacles.push({
        type: type,
        x: Math.floor(Math.random() * 3) * laneWidth + 40,
        y: -120,
        width: 70,
        height: type === "train" ? 140 : 80
    });

}

// Create coin
function createCoin() {

    coinList.push({
        x: Math.floor(Math.random() * 3) * laneWidth + 55,
        y: -50,
        radius: 15
    });

}

// Spawn objects
setInterval(() => {
    if (gameRunning) createObstacle();
}, 1500);

setInterval(() => {
    if (gameRunning) createCoin();
}, 1200);

// Controls
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

// Keyboard
document.addEventListener("keydown", e => {

    if (e.key === "ArrowLeft") moveLeft();

    if (e.key === "ArrowRight") moveRight();

    if (e.key === "ArrowUp") jump();

    if (e.key === "ArrowDown") slide();

});

// Game Over
function gameOver() {

    gameRunning = false;

    document.getElementById("gameContainer").style.display = "none";

    document.getElementById("gameOverScreen").style.display = "block";

    document.getElementById("finalScore").innerText = score;

    if (score > highScore) {

        localStorage.setItem("highscore", score);

    }

}

// Restart
function restartGame() {

    location.reload();

}

// Start button
document.getElementById("startBtn").onclick = () => {

    document.getElementById("startScreen").style.display = "none";

    document.getElementById("gameContainer").style.display = "block";

    gameRunning = true;

};
function update() {

    if (!gameRunning) return;

    speed += 0.0008;

    // Jump physics
    player.y += player.velocityY;
    player.velocityY += 0.8;

    if (player.y >= 500 && !player.sliding) {

        player.y = 500;
        player.velocityY = 0;
        player.jumping = false;

    }

    // Obstacles
    obstacles.forEach(obs => {

        obs.y += speed;

        // Collision
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {

            lives--;
            livesText.innerText = lives;

            obs.y = 700;

            if (lives <= 0) {

                gameOver();

            }

        }

        // Score
        if (obs.y > 650) {

            score++;
            scoreText.innerText = score;

        }

    });

    // Coins
    coinList.forEach(c => {

        c.y += speed;

        let dx = (player.x + 25) - c.x;
        let dy = (player.y + 40) - c.y;

        if (Math.sqrt(dx * dx + dy * dy) < 40) {

            coins++;

            coinsText.innerText = coins;

            c.y = 700;

        }

    });

}


function draw() {

    ctx.clearRect(0, 0, 400, 600);

    roadOffset += speed;

    // Sky
    ctx.fillStyle = "#64c8ff";
    ctx.fillRect(0, 0, 400, 200);

    // Buildings
    ctx.fillStyle = "#555";

    for (let i = 0; i < 5; i++) {

        ctx.fillRect(
            i * 80,
            100,
            60,
            150
        );

    }

    // Road
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 200, 400, 400);

    // Lane lines
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

    // Player
    ctx.drawImage(
        playerImg,
        player.x,
        player.y,
        player.width,
        player.height
    );

    // Obstacles
    obstacles.forEach(obs => {

        if (obs.type === "train") {

            ctx.drawImage(
                trainImg,
                obs.x,
                obs.y,
                obs.width,
                obs.height
            );

        } else {

            ctx.drawImage(
                barrierImg,
                obs.x,
                obs.y,
                obs.width,
                obs.height
            );

        }

    });

    // Coins
    coinList.forEach(c => {

        ctx.drawImage(
            coinImg,
            c.x - 15,
            c.y - 15,
            30,
            30
        );

    });

}


function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
