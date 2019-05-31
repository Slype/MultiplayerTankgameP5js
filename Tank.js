class Tank {
	constructor(id, x, y, w, h, angle, speed, acc, color){
		this.id = id;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.health = tankSettings["health"];
		this.moving = false;
		this.firing = false;
		this.firingCooldown = 0;
		this.angle = angle;
		this.turningSpeed = 0;
		this.speed = speed;
		this.acc = acc;
		this.color = color;
		this.projectiles = [];
		this.spawnProtection = false;
	}

    // Call to draw the tank on the canvas
	draw(){
        // Translate the matrix to its position
		push();
		translate(this.x + (this.w / 2), this.y + (this.h / 2));
		rotate(-this.angle);
		rectMode(CENTER);
		fill(this.color);
		rect(0, 0, this.w, this.h); // Body
		rect(this.w / 2, 0, 15, 4); // Pipe
		pop();
	}

    // Call to update the tank by checking movement, collision and firing
	update(){
        // Rotate the tank if it currently has a rotation speed
		this.rotate();
		if(this.moving){
			this.move();
            // Check collision
			let collision = checkCollisions(this);
			if(collision.colliding){
                // Revert move
				this.move(-1);
                // Alert the user of a collision by vibrating their phone
				vibrateUser(this.id);
			}
		}
        // Fire a projectile if allowed to
		if(this.firing){
			if(this.firingCooldown == 0)
				this.fire();
			else
				this.firingCooldown -= 1;
		}
	}

    // Call to move the tank in its facing direction
	move(dir = 1){
		angleMode(DEGREES);
		this.x += cos(-this.angle) * this.speed * dir;
		this.y += sin(-this.angle) * this.speed * dir;

	}

    // Call to rotate the tank with its turningSpeed
	rotate(){
		this.angle += this.turningSpeed;
	}

    // Call to inflict damage to the tank
	takeDamage(dmg, otherTankID){
		this.health -= dmg;
        // If its health falls below 0 considered it to be dead
		if(this.health < 0){
			this.respawn();
			scoreboard.playerKill(otherTankID, this.id);
		}
	}

    // Call to respawn tank
	respawn(){
        // Vibrate the user's phone to indicate its death
		vibrateUser(this.id, 500);
        // Calculate a new spawnpoint and assign it
		let newspawn = newSpawnpoint();
		this.x = newspawn.x;
		this.y = newspawn.y;
		this.angle = newspawn.angle;
        // Reset everything else
		this.moving = false;
		this.firing = false;
		this.health = tankSettings["health"];
		this.spawnProtection = true;
        // Give it spawn protection (invincible for a short period after spawning)
		setTimeout(() => { this.spawnProtection = false; }, tankSettings["spawnProtection"]);
	}

    // Call to fire a projectile
	fire(){
        // Calculate the origin of the projectile based on the tank's pipe
		let px = this.x + (this.w / 2) + (cos(-this.angle) * 10) + 4;
		let py = this.y + (this.h / 2) + (sin(-this.angle) * 15);
        // Spawn a projectile
		this.projectiles.push(new Projectile(px, py, this.angle, this));
		this.firingCooldown = tankSettings["projectileCooldown"];
	}
}
