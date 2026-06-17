const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");

let highScore = localStorage.getItem("highscore") || 0;
highScoreText.innerText = highScore;

let gameRunning = false;

const laneWidth = 130;
let lane = 1;

let score = 0;
let coins = 0;

const player = {
    x: laneWidth + 40,
    y: 500,
    width: 50,
    height: 80,
    velocityY: 0,
    jumping: false
};

let obstacles = [];
let coinList = [];

function createObstacle(){
    obstacles.push({
        x: Math.floor(Math.random()*3)*laneWidth+40,
        y:-100,
        width:50,
        height:80
    });
}

function createCoin(){
    coinList.push({
        x: Math.floor(Math.random()*3)*laneWidth+55,
        y:-50,
        radius:15
    });
}

setInterval(()=>{
    if(gameRunning) createObstacle();
},1500);

setInterval(()=>{
    if(gameRunning) createCoin();
},1200);

function moveLeft(){
    if(lane>0){
        lane--;
        player.x=lane*laneWidth+40;
    }
}

function moveRight(){
    if(lane<2){
        lane++;
        player.x=lane*laneWidth+40;
    }
}

function jump(){
    if(!player.jumping){
        player.velocityY=-15;
        player.jumping=true;
    }
}

document.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft") moveLeft();
    if(e.key==="ArrowRight") moveRight();
    if(e.key==="ArrowUp") jump();
});

function gameOver(){

    gameRunning=false;

    document.getElementById("gameContainer").style.display="none";
    document.getElementById("gameOverScreen").style.display="block";

    document.getElementById("finalScore").innerText=score;

    if(score>highScore){
        localStorage.setItem("highscore",score);
    }
}

function restartGame(){
    location.reload();
}

document.getElementById("startBtn").onclick=()=>{
    document.getElementById("startScreen").style.display="none";
    document.getElementById("gameContainer").style.display="block";
    gameRunning=true;
};

function update(){

    if(!gameRunning) return;

    player.y+=player.velocityY;
    player.velocityY+=0.8;

    if(player.y>=500){
        player.y=500;
        player.velocityY=0;
        player.jumping=false;
    }

    obstacles.forEach(obs=>{

        obs.y+=7;

        if(
            player.x<obs.x+obs.width &&
            player.x+player.width>obs.x &&
            player.y<obs.y+obs.height &&
            player.y+player.height>obs.y
        ){
            gameOver();
        }

        if(obs.y>600){
            score++;
            scoreText.innerText=score;
        }
    });

    coinList.forEach(c=>{

        c.y+=7;

        let dx=(player.x+25)-c.x;
        let dy=(player.y+40)-c.y;

        if(Math.sqrt(dx*dx+dy*dy)<40){
            coins++;
            coinsText.innerText=coins;
            c.y=700;
        }
    });
}

function draw(){

    ctx.clearRect(0,0,400,600);

    ctx.fillStyle="#666";
    ctx.fillRect(130,0,3,600);
    ctx.fillRect(260,0,3,600);

    ctx.fillStyle="cyan";
    ctx.fillRect(player.x,player.y,50,80);

    ctx.fillStyle="red";
    obstacles.forEach(obs=>{
        ctx.fillRect(obs.x,obs.y,50,80);
    });

    ctx.fillStyle="gold";

    coinList.forEach(c=>{
        ctx.beginPath();
        ctx.arc(c.x,c.y,c.radius,0,Math.PI*2);
        ctx.fill();
    });
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
