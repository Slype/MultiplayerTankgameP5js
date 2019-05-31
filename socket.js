// Connect to the proxy
let socket = io.connect("http://" + appHost + ":" + appPort);

// Attempt to authenticate
socket.emit("auth", authKey, (response) => {
	if(!response){
		console.log("Authentication error...");
		return;
	}
	console.log("Authentication successful!");
    // Add already connected clients to the game
	let clients = JSON.parse(response);
	for(let client of clients){
		newTank(client);
	}
});

// Received when a new player connects
socket.on("newPlayer", (jsondata) => { // {id, name, color}
	let data = JSON.parse(jsondata);
	newTank(data);
});

// Creates a new tank
function newTank(data){
	let spawnpoint = newSpawnpoint();
	tanks.push(new Tank(data["id"], spawnpoint.x, spawnpoint.y, tankSettings["width"], tankSettings["height"], spawnpoint.angle, tankSettings["speed"], tankSettings["acceleraton"], data["color"]));
	scoreboard.addPlayer(data["id"], data["name"], tankSettings["defaultElo"], data["color"]);
}

// Vibrate user's phone
function vibrateUser(id, t = 200){
	socket.emit("vibrate", JSON.stringify({id: id, time: t}));
}

// Received when someone disconnects
socket.on("removePlayer", (jsondata) => { // {id}
	let data = JSON.parse(jsondata);
	for(let i = 0;i < scoreboard.players.length;i++){
		if(scoreboard.players[i].id == data["id"]){
			scoreboard.removePlayer(data["id"]);
			break;
		}
	}
    // Pop it off the list
	for(let i = 0;i < tanks.length;i++){
		if(tanks[i].id == data["id"]){
			tanks.splice(i, 1);
			break;
		}
	}
});

// Received when a player tilts their phone
socket.on("tilt", (jsondata) => { // {id, angle}
	let data = JSON.parse(jsondata);
	updateTank(data);
});

// Received when a player is hitting or letting go of their throttle
socket.on("moving", (jsondata) => { // {id, moving}
	let data = JSON.parse(jsondata);
	updateTank(data);
});

// Received when a player hits the fire button
socket.on("firing", (jsondata) => { // {id, firing}
	let data = JSON.parse(jsondata);
	updateTank(data);
});
