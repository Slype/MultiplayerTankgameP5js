// --- Global variables --- //
let authKey = "asd9kajs9d8fujas9d8"; // Shared with proxy to establish it as host
let tanks = [];
let scoreboard;
let canvas;
let canvasSettings = {
	"width": 600,
	"height": 600,
	"parent": "canvasContainer",
	"background": "#3d3d3d"
};
let tankSettings = {
	"width": 20,
	"height": 20,
	"health": 100,
	"acceleraton": 1.5,
	"speed": 2,
	"turningSpeed": 7,
	"spawnProtection": 1000,
	"defaultElo": 1000,
	"projectileDiameter": 5,
	"projectileSpeed": 3,
	"projectileDamage": 50,
	"projectileCooldown": 15
};

// Finds an available spot on the map where it's possible to spawn
function newSpawnpoint(){
	let x, y;
	let angle = random(0, 360);
	do {
		x = random(50, width - 50);
		y = random(50, height - 50);
	} while(checkSpawnpoint(x, y, tankSettings["width"], tankSettings["height"])["colliding"]);
	return {x, y, angle};
}

// Call to update a tank with various properties
function updateTank(data){
	for(let tank of tanks){
        // Figure out which tank it is
		if(tank.id == data["id"]){
			if(data.hasOwnProperty("angle")){
				let angle = constrain(data["angle"], -90, 90);
				tank.turningSpeed = map(angle, -90, 90, tankSettings["turningSpeed"], -tankSettings["turningSpeed"]);
			}
			else if(data.hasOwnProperty("moving")){
				tank.moving = data["moving"];
			}
			else if(data.hasOwnProperty("firing")){
				tank.firing = data["firing"];
			}
			else if(data.hasOwnProperty("damage") && data.hasOwnProperty("inflictor")){
				tank.takeDamage(data["damage"], data["inflictor"]);
				socket.emit("vibrate", JSON.stringify({id: tank.id}), (response) => {
					if(!response)
						console.log("Unable to vibrate phone of player with ID = " + tank.id);
				});
			}
			else if(data.hasOwnProperty("respawn")){
				tank.respawn();
			}
		}
	}
}

// Standard function with P5js
function setup(){
    // Create canvas and assign its parent element
	canvas = createCanvas(canvasSettings["width"], canvasSettings["height"]);
	canvas.parent(canvasSettings["parent"]);
	document.getElementById("canvasContainer").appendChild(document.getElementById("scoreboard")); // Reposition element on the right side
    // Create a scoreboard
	scoreboard = new Scoreboard(document.getElementById("scoreboard"));
}

// Standard function with P5js
function draw(){
	angleMode(DEGREES);
	background(canvasSettings["background"]);
    // Draw walls
	for(let wall of walls){
		push();
		translate(wall.x, wall.y);
		rect(0, 0, wall.w, wall.h);
		pop();
	}
    // Update and draw tanks & projectiles
	for(let tank of tanks){
		tank.update();
		for(let projectile of tank.projectiles){
			projectile.update();
			projectile.draw();
		}
		for(let i = tank.projectiles.length - 1;i >= 0;i--){
            // If any of the projectiles has its property dead set, remove it
			if(tank.projectiles[i].dead)
				tank.projectiles.splice(i, 1);
			else {
				tank.projectiles[i].update();
				tank.projectiles[i].draw();
			}
		}
		tank.draw();
	}
}
