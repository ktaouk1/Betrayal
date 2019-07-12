class Tile {
	constructor(name, location, doors, type) {
		this.name = name;
		this.location = location;
		this.doors = doors;
		this.type = type;
		var players = [];  // All players occupying this tile
		var xCoord;
		var yCoord;
	}

	draw(x, y, size, curve) {
		// Give the starting tiles a different colour to stand out
		if (this.name.includes("Landing") || this.name.includes("Entrance")) {
			fill(30);
		} else {
			fill(random(220), random(220), random(220));
		}
		// White rectangle
		stroke(255);
		rect(x, y, size, size, curve);
		// Print tile name. Split into 2 lines if long
		fill(255);
		stroke(90, 0.8);
		if (this.name.includes("_")) {
			var fullName = this.name.split("_");
			text(fullName[0], x-25, y-15);
			text(fullName[1], x-25, y);
		} else {
			text(this.name.replace(/\_/g, " "), x-25, y-15);
		}
		noFill();
	}
}
