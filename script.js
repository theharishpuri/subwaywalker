const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const laneWidth = 130;
let lane = 1;

const player = {
    x: laneWidth + 40,
    y: 500,
    width: 50,
    height: 80,
    velocityY: 0,
    jumping: false
};

let obstacles = [];
let score = 0;

function createObstacle(){
    let obstacleLane = Math.floor(Math.random()*3);

    obstacles.push({
        x: obstacleLane*laneWidth + 40,
        y: -100,
        width:50,
        height:80
    });
}

setInterval(createObstacle,1500);

function moveLeft(){
    if(lane>0){
        lane--;
        player.x = lane*laneWidth + 40;
    }
}

function moveRight(){
    if(lane<2){
        lane++;
        player.x = lane*laneWidth + 40;
    }
}

function jump(){
    if(!player.jumping){
        player.velocityY = -15;
        player.jumping = true;
    }
}

document.addEventListener("keydown", e=>{
    if(e.key==="ArrowLeft") moveLeft();
    if(e.key==="ArrowRight") moveRight();
    if(e.key==="ArrowUp") jump();
});

function update(){

    player.y += player.velocityY;
    player.velocityY += 0.8;

    if(player.y>=500){
        player.y=500;
        player.velocityY=0;
        player.jumping=false;
    }

    for(let i=0;i<obstacles.length;i++){

        obstacles[i].y += 6;

        if(
            player.x < obstacles[i].x + obstacles[i].width &&
            player.x + player.width > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].height &&
            player.y + player.height > obstacles[i].y
        ){
            alert("Game Over! Score: "+score);
            location.reload();
        }

        if(obstacles[i].y>600){
            obstacles.splice(i,1);
            score++;
        }
    }
}

function draw(){

    ctx.clearRect(0,0,400,600);

    // road lanes
    ctx.fillStyle="#666";
    ctx.fillRect(130,0,3,600);
    ctx.fillRect(260,0,3,600);

    // player
    ctx.fillStyle="cyan";
    ctx.fillRect(player.x,player.y,player.width,player.height);

    // obstacles
    ctx.fillStyle="red";
    obstacles.forEach(obs=>{
        ctx.fillRect(obs.x,obs.y,obs.width,obs.height);
    });

    ctx.fillStyle="white";
    ctx.font="30px Arial";
    ctx.fillText("Score: "+score,10,40);
}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
