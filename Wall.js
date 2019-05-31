class Wall {
	constructor(x, y, w, h, color){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = color;
	}

    // Call to draw the wall on the canvas
	draw(){
		push();
		translate(this.x, this.y);
		rectMode(CORNER);
		fill(this.color);
		rect(0, 0, this.w, this.h);
		pop();
	}
}
