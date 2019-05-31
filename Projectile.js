class Projectile {
	constructor(x, y, angle, owner){
		this.x = x;
		this.y = y;
		this.d = tankSettings["projectileDiameter"];
		this.angle = angle;
		this.speed = tankSettings["projectileSpeed"];
		this.owner = owner;
		this.id = this.owner.id;
		this.damage = tankSettings["projectileDamage"];
		this.dead = false;
	}

    // Call to draw the projectile on the canvas
	draw(){
		push();
		translate(this.x + (this.d / 2), this.y + (this.d / 2));
		fill(this.owner.color);
		circle(0, 0, this.d / 2);
		pop();
	}

    // Call to update the projectile by checking movement and collision
	update(){
		this.move();
        // Check collision
		let collision = checkCollisions(this);
		if(collision.colliding){
			if(!collision.tank) // It hit a wall
				this.die();
			else { // Collision with another tank
				let otherTank = collision.id;
				updateTank({id: otherTank, damage: this.damage, inflictor: this.owner.id});
				this.die();
			}
		}
	}

    // Call to move the projectile in its facing direction
	move(){
		this.x += cos(-this.angle) * this.speed;
		this.y += sin(-this.angle) * this.speed;
	}

    // Call to update its dead property so that draw() can delete it
	die(){
		this.dead = true;
	}
}
