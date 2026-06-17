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

/* AUDIO */
const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;

/* UI */
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const livesText = document.getElementById("lives");
const highScoreText = document.getElementById("highScore");

/* GAME STATE */
let gameRunning = false;

let score = 0;
let coins = 0;
let lives = 3;
let speed = 7;

/* HIGH SCORE */
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

/* SPAWN CONTROL (FIXED MEMORY SAFE) */
let lastSpawn = 0;
let lastCoin = 0;

/* INPUT */
document.addEventListener("keydown", e => {
if(e.key==="ArrowLeft") moveLeft();
if(e.key==="ArrowRight") moveRight();
if(e.key==="ArrowUp") jump();
if(e.key==="ArrowDown") slide();
});

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

/* START */
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

if(score>highScore){
localStorage.setItem("hs",score);
}
}

/* UPDATE */
function update(){

if(!gameRunning)return;

speed = Math.min(14, speed + 0.0008);

/* player physics */
player.y += player.vy;
player.vy += 0.8;

if(player.y>=500){
player.y=500;
player.vy=0;
player.jump=false;
}

/* spawn safe timing */
if(Date.now()-lastSpawn>1200){
spawn();
lastSpawn=Date.now();
}

if(Date.now()-lastCoin>900){
spawnCoin();
lastCoin=Date.now();
}

/* obstacles */
for(let i=obs.length-1;i>=0;i--){
let o=obs[i];
o.y+=speed;

if(
player.x<o.x+o.w &&
player.x+player.w>o.x &&
player.y<o.y+o.h &&
player.y+player.h>o.y
){
lives--;
livesText.innerText=lives;
obs.splice(i,1);
if(lives<=0)gameOver();
}

if(o.y>700){
obs.splice(i,1);
score++;
scoreText.innerText=score;
}
}

/* coins */
for(let i=coinList.length-1;i>=0;i--){
let c=coinList[i];
c.y+=speed;

let dx=(player.x+25)-c.x;
let dy=(player.y+40)-c.y;
let d=Math.sqrt(dx*dx+dy*dy);

if(d<35){
coins++;
coinsText.innerText=coins;
coinList.splice(i,1);
}

if(c.y>700) coinList.splice(i,1);
}

}

/* SPAWN */
function spawn(){
let t=Math.random()<0.5?"train":"barrier";
obs.push({
t,
x:Math.floor(Math.random()*3)*laneW+40,
y:-120,
w:70,
h:t==="train"?140:80
});
}

function spawnCoin(){
coinList.push({
x:Math.floor(Math.random()*3)*laneW+50,
y:-40
});
}

/* DRAW */
function draw(){
ctx.clearRect(0,0,400,600);

ctx.fillStyle="#4fc3ff";
ctx.fillRect(0,0,400,600);

ctx.fillStyle="#444";
ctx.fillRect(0,200,400,400);

ctx.drawImage(playerImg,player.x,player.y,player.w,player.h);

obs.forEach(o=>{
ctx.drawImage(o.t==="train"?trainImg:barrierImg,o.x,o.y,o.w,o.h);
});

coinList.forEach(c=>{
ctx.drawImage(coinImg,c.x-15,c.y-15,30,30);
});
}

/* LOOP */
function loop(){
requestAnimationFrame(loop);
update();
draw();
}
loop();

function restartGame(){
location.reload();
}
