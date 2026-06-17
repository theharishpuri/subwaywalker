const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* IMAGES */
const playerImg = new Image();
playerImg.src = "assets/player.png";

const trainImg = new Image();
trainImg.src = "assets/train.png";

const barrierImg = new Image();
barrierImg.src = "assets/barrier.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

/* SOUND */
const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;

/* UI */
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const highScoreText = document.getElementById("highScore");

/* GAME STATE */
let gameRunning = false;
let paused = false;

let score = 0;
let coins = 0;
let lives = 3;
let speed = 7;

let highScore = localStorage.getItem("hs") || 0;
highScoreText.innerText = highScore;

/* LANES */
const laneW = 130;
let lane = 1;

/* PLAYER */
const player = {
x: laneW + 40,
y: 500,
w: 50,
h: 80,
vy: 0,
jump:false,
slide:false
};

/* OBJECTS */
let obs = [];
let coinList = [];

/* SPAWN */
setInterval(()=>{ if(gameRunning) spawn(); },1400);
setInterval(()=>{ if(gameRunning) coin(); },1100);

function spawn(){
let t = Math.random()<0.5?"train":"barrier";
obs.push({
t,
x:Math.floor(Math.random()*3)*laneW+40,
y:-120,
w:70,
h:t==="train"?140:80
});
}

function coin(){
coinList.push({
x:Math.floor(Math.random()*3)*laneW+50,
y:-40,
r:15
});
}

/* CONTROLS */
function moveLeft(){ if(lane>0){lane--;player.x=lane*laneW+40;} }
function moveRight(){ if(lane<2){lane++;player.x=lane*laneW+40;} }

function jump(){
if(!player.jump){
player.vy=-15;
player.jump=true;
}
}

function slide(){
if(player.slide)return;
player.slide=true;
player.h=40;
setTimeout(()=>{player.h=80;player.slide=false;},600);
}

/* GAME START */
document.getElementById("startBtn").onclick=()=>{
document.getElementById("startScreen").style.display="none";
gameRunning=true;
bgMusic.play();
};

/* GAME OVER */
function gameOver(){
gameRunning=false;
bgMusic.pause();
document.getElementById("gameOverScreen").style.display="flex";
document.getElementById("finalScore").innerText=score;
if(score>highScore)localStorage.setItem("hs",score);
}

/* UPDATE */
function update(){
if(!gameRunning||paused)return;

speed+=0.0007;

/* physics */
player.y+=player.vy;
player.vy+=0.8;

if(player.y>=500){
player.y=500;
player.vy=0;
player.jump=false;
}

/* obstacles */
obs.forEach(o=>{
o.y+=speed;

if(
player.x<o.x+o.w &&
player.x+player.w>o.x &&
player.y<o.y+o.h &&
player.y+player.h>o.y
){
lives--;
livesText.innerText=lives;
o.y=800;
if(lives<=0)gameOver();
}

if(o.y>650){
score++;
scoreText.innerText=score;
}
});

/* coins */
coinList.forEach(c=>{
c.y+=speed;

let dx=(player.x+25)-c.x;
let dy=(player.y+40)-c.y;
let d=Math.sqrt(dx*dx+dy*dy);

if(d<40){
coins++;
coinsText.innerText=coins;
c.y=900;
}
});
}

/* DRAW */
function draw(){
ctx.clearRect(0,0,400,600);

/* bg */
let g=ctx.createLinearGradient(0,0,0,600);
g.addColorStop(0,"#4fc3ff");
g.addColorStop(1,"#b3e5fc");
ctx.fillStyle=g;
ctx.fillRect(0,0,400,600);

/* road */
ctx.fillStyle="#444";
ctx.fillRect(0,200,400,400);

/* player */
ctx.drawImage(playerImg,player.x,player.y,player.w,player.h);

/* obstacles */
obs.forEach(o=>{
ctx.drawImage(o.t==="train"?trainImg:barrierImg,o.x,o.y,o.w,o.h);
});

/* coins */
coinList.forEach(c=>{
ctx.drawImage(coinImg,c.x-15,c.y-15,30,30);
});
}

/* LOOP */
function loop(){
requestAnimationFrame(loop);
if(!gameRunning||paused)return;
update();
draw();
}
loop();
