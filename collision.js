function checkCollisions(self) {
	//  Other tanks.
	for (let tank of tanks) {
		if (self.id != tank.id) {
			if (((self.x < tank.x + tank.w && self.x > tank.x) || (self.x + self.w > tank.x && self.x < tank.x)) &&
				((self.y < tank.y + tank.h && self.y > tank.y) || (self.y + self.h > tank.y && self.y < tank.y))) {
					//console.log("Doopsie");
					return {colliding: true, tank: true, id: tank.id};
			}
		}
	}

	//  Obstacle walls.
	for (let wall of walls) {
		if (((self.x < wall.x + wall.w && self.x > wall.x) || (self.x + self.w > wall.x && self.x < wall.x)) &&
			((self.y < wall.y + wall.h && self.y > wall.y) || (self.y + self.h > wall.y && self.y < wall.y))) {
				//console.log("Oopsie");
				return {colliding: true, tank: false};
		}
	}

	//  Edges of screen.
	if(self.hasOwnProperty("w") && self.hasOwnProperty("h")){
		if (self.x < 0 || self.x + self.w > width ||
			self.y < 0 || self.y + self.h > height) {
				//console.log("Poopsie");
				return {colliding: true, tank: false};
		}
	}
	else {
		if(self.x < 0 || self.x > width || self.y < 0 || self.y > height)
			return {colliding: true, tank: false};
	}

	//  Otherwise only return false.
	return {colliding: false};
}

function checkSpawnpoint(x, y, xClearence, yClearence){
	let tank = {x, y, w: xClearence, h: yClearence};
	return checkCollisions(tank);
}
