/*
	TODO:
	-> Zoom and pan with mouse, maybe buttons
	-> [BUG] Groups of >2 tiles negate each other's borders. Fix this
	-> Damage function - Implement distribution of dmg across multiple attributes
	-> Make the Entrance Hall tile 3x1
	-> Find a nice, consistent colour scheme (one colour for each floor? Tile?)
	-> BUILD SOME AI PLAYERS TO SIMULATE GAMEPLAY
	-> Implement a single haunting
*/

var characters = [];
var tiles = [];
var players = [];
var die = [0, 0, 0, 1, 2, 3];  // Values on a single die
var tilesInPlay = [];
var haunting = false;
var hovering = false;

function setup() {


	/* INITIALISE DATA AND VARIABLES */


	createCanvas(800, 800);
	background(51);
	//Basic alignment grid
	stroke(255);
	strokeWeight(0.25);
	drawingContext.setLineDash([2, 8]);
	for (var i = 0; i < width/80; i++) {
		line(i*80, 0, i*80, height);
		line(0, i*80, width, i*80);
	}
	drawingContext.setLineDash([]);
	rectMode(CENTER);
	strokeWeight(2);
	noFill();

	// Load character data
	var chars = (function() {
		var json = null;
		$.ajax({
			'async' : false,
			'global' : false,
			'url' : "/Javascript/characters.json",
			'dataType' : "json",
			'success' : function (data) {
				json = data;
			}
		});
		return json;
	})();
	characters = Object.entries(chars);

	// Load board tiles
	var tile = (function() {
		var json = null;
		$.ajax({
			'async' : false,
			'global' : false,
			'url' : "/Javascript/tiles.json",
			'dataType' : "json",
			'success' : function (data) {
				json = data;
			}
		});
		return json;
	})();
	var tilestemp = Object.entries(tile);
	for (var i = 0; i < tilestemp.length; i++) {
		var newtile = new Tile(tilestemp[i][0], tilestemp[i][1].location, tilestemp[i][1].doors, tilestemp[i][1].type);
		tiles.push(newtile);
	}

	// Light and dark theme buttons
	var lighttheme = document.getElementById("light").addEventListener("click", function() {
		var info = document.getElementById("info");
		var actions = document.getElementById("actions");
		var title = document.getElementById("title");
		var body = document.getElementById("body");
		var heading = document.getElementById("heading");
		info.style.backgroundColor = "#eee";
		info.style.borderColor = "rgb(51, 51, 51)";
		info.style.color = "rgb(51, 51, 51)";
		actions.style.backgroundColor = "#eee";
		actions.style.borderColor = "rgb(51, 51, 51)";
		actions.style.color = "rgb(51, 51, 51)";
		title.style.color = "rgb(51, 51, 51)";
		body.style.backgroundColor = "white";
		heading.style.backgroundColor = "#eee";
		heading.style.borderColor = "rgb(51, 51, 51)";
	});
	var darktheme = document.getElementById("dark").addEventListener("click", function() {
		var info = document.getElementById("info");
		var actions = document.getElementById("actions");
		var title = document.getElementById("title");
		var body = document.getElementById("body");
		var heading = document.getElementById("heading");
		info.style.backgroundColor = "rgb(27, 29, 31)";
		info.style.borderColor = "rgb(86, 85, 83)";
		info.style.color = "rgb(230, 226, 219)";
		actions.style.backgroundColor = "rgb(27, 29, 31)";
		actions.style.borderColor = "rgb(86, 85, 83)";
		actions.style.color = "rgb(230, 226, 219)";
		title.style.color = "rgb(230, 226, 219)";
		body.style.backgroundColor = "rgb(24, 25, 26)";
		heading.style.backgroundColor = "rgb(27, 29, 31)";
		heading.style.borderColor = "rgb(86, 85, 83)";
	});


	/* VISUALISE BOARD TILES
		This includes:
			> Checking the amount of free doors a tile has
			> Selecting a new tile from the stack
			> Drawing the tile at a random free position

		Create function to handle adjacent tile checks
	*/


	// Add the base landing tiles
	for (var i = 0; i < tiles.length; i++) {
		// Draw Entrance Hall, centre of board
		// TODO - Make it 3x1 eventually, not 1x1
		if (tiles[i].name == "Entrance_Hall") {
			var landingZone = tiles[i];
			landingZone.xCoord = width/2;
			landingZone.yCoord = width/2;
			landingZone.draw(landingZone.xCoord, landingZone.yCoord, 70, 7);
			tilesInPlay.push(landingZone);
			tiles.splice(i, 1);
		// Draw basement landing, bottom left of board
		} else if (tiles[i].name == "Basement_Landing") {
			var basement = tiles[i];
			basement.xCoord = 80;
			basement.yCoord = 720;
			basement.draw(basement.xCoord, basement.yCoord, 70, 7);
			tilesInPlay.push(basement);
			tiles.splice(i, 1);
		// Draw upper landing, upper right of board
		} else if (tiles[i].name == "Upper_Landing") {
			var upper = tiles[i];
			upper.xCoord = 720;
			upper.yCoord = 80;
			upper.draw(upper.xCoord, upper.yCoord, 70, 7);
			tilesInPlay.push(upper);
			tiles.splice(i, 1);
		}/* else if (tiles[i].name == "Statuary_Corridor") {
			var corridor = tiles[i];
			corridor.xCoord = 80;
			corridor.yCoord = 640;
			corridor.draw(corridor.xCoord, corridor.yCoord, 70, 7);
			tilesInPlay.push(corridor);
			tiles.splice(i, 1);
		} else if (tiles[i].name == "Mystic_Elevator") {
			var elevator = tiles[i];
			elevator.xCoord = 160;
			elevator.yCoord = 720;
			elevator.draw(elevator.xCoord, elevator.yCoord, 70, 7);
			tilesInPlay.push(elevator);
			tiles.splice(i, 1);
		} else if (tiles[i].name == "Creaky_Hallway") {
			var hallway = tiles[i];
			hallway.xCoord = 160;
			hallway.yCoord = 640;
			hallway.draw(hallway.xCoord, hallway.yCoord, 70, 7);
			tilesInPlay.push(hallway);
			tiles.splice(i, 1);
		}*/
	}

	/* GAMEPLAY */


	// Get 4 random players for the game.. [12 characters total]
	var temp = characters;
	for (var i = 0; i < 4; i++) {
		var index = Math.floor(Math.random() * temp.length);
		var player = temp[index];
		temp.splice(index, 1);
		players.push(player);
	}

	//Introductory message
	var para = document.getElementById("news");
	para.textContent += "Welcome to Betrayal at House on the Hill! These are our players:\r\n\r\n";
	//Display 4 random playable characters
	for (var i = 0; i < players.length; i++) {
		para.textContent += " > " + players[i][0].replace(/\_/g, " ") + ":\n";
		para.textContent += "Speed: " + players[i][1].speed[players[i][1].speedIndex] + "\r\n";
		para.textContent += "Might: " + players[i][1].might[players[i][1].mightIndex] + "\r\n";
		para.textContent += "Sanity: " + players[i][1].sanity[players[i][1].sanityIndex] + "\r\n";
		para.textContent += "Knowledge: " + players[i][1].knowledge[players[i][1].knowledgeIndex] + "\r\n\r\n";
	}
	para.textContent += "All players are currently in the Entrance Hall. Who do you want to play as?\r\n";
	//Buttons for choosing player
	var actions = document.getElementById("actions");
	for (var i = 0; i < players.length; i++) {
		var btn = document.createElement("button");
		btn.setAttribute("id", players[i][0]);
		btn.setAttribute("class", "players");
		btn.innerHTML = "Play as " + players[i][0].replace(/\_/g, " ");
		btn.addEventListener("click", function() {
			para.textContent += "You chose " + this.id.replace(/\_/g, " ") + ".\r\n\r\n";
			//Clear actions section, display stats for chosen player.
			actions.innerHTML = "";
			var playerInfo = document.createElement("p");
			playerInfo.innerText += this.id.replace(/\_/g, " ") + " \r\n\r\n";

			var speed = "\r\n\r\nSpeed: ";
			var might = "Might: ";
			var sanity = "Sanity: ";
			var knowledge = "Knowledge: ";
			var main;
			//Get the selected character data
			for (var i = 0; i < players.length; i++) {
				if (this.id == players[i][0]) {
					main = players[i];
				}
			}
			for (var i = 0; i < main[1].speed.length; i++) {
				if (i == main[1].speedIndex) {
					speed += "[" + main[1].speed[i] + "] ";
				} else {
					speed += main[1].speed[i] + " ";
				}
				if (i == main[1].mightIndex) {
					might += "[" + main[1].might[i] + "] ";
				} else {
					might += main[1].might[i] + " ";
				}
				if (i == main[1].sanityIndex) {
					sanity += "[" + main[1].sanity[i] + "] ";
				} else {
					sanity += main[1].sanity[i] + " ";
				}
				if (i == main[1].knowledgeIndex) {
					knowledge += "[" + main[1].knowledge[i] + "] ";
				} else {
					knowledge += main[1].knowledge[i] + " ";
				}
			}
			playerInfo.innerText += speed + "\r\n" + might + "\r\n" + sanity + "\r\n" + knowledge + "\r\n";
			actions.appendChild(playerInfo);
		});
		actions.appendChild(btn);
	}

	/*******Debugging purposes********/
	// Pull random tiles from the stack, avoid overlapping
	var overlap = false;
	for (var i = 0; i < 4; i++) {
		var rand = 80 * int(random(1, 10));
		var rand2 = 80 * int(random(1, 10));
		for (var j = 0; j < tilesInPlay.length; j++) {
			if (rand == tilesInPlay[j].xCoord && rand2 == tilesInPlay[j].yCoord) {
				overlap = true;
			}
		}
		if (!overlap) {
			var randTile = getTile("ground");
			randTile.draw(rand, rand2, 70, 7);
			randTile.xCoord = rand;
			randTile.yCoord = rand2;
			tilesInPlay.push(randTile);
		} else {
			i--;
		}
	}
	/*********************************/

}

// Gets random tile from stack, given current floor
function getTile(floor) {
	while (tiles.length > 0) {
		var tile = tiles[Math.floor(Math.random() * tiles.length)];
		if (tile.location.includes(floor)) {
			tiles.splice(tiles.indexOf(tile), 1);
			return tile;
		}
	}
}

// Display list of characters and their current stats
function displayCharacters(player) {
	// If specified, print player stats. Otherwise print all.
	if (player == null) {
		for (var i = 0; i < characters.length; i++) {
			console.log(characters[i][0].replace(/\_/g, " ") + "'s current stats:");
			console.log("Speed:", characters[i][1].speed[characters[i][1].speedIndex]);
			console.log("Might:", characters[i][1].might[characters[i][1].mightIndex]);
			console.log("Sanity:", characters[i][1].sanity[characters[i][1].sanityIndex]);
			console.log("Knowledge:", characters[i][1].knowledge[characters[i][1].knowledgeIndex]);
		}
	} else {
		console.log(player[0].replace(/\_/g, " ") + "'s current stats:");
		console.log("Speed:", player[1].speed[player[1].speedIndex]);
		console.log("Might:", player[1].might[player[1].mightIndex]);
		console.log("Sanity:", player[1].sanity[player[1].sanityIndex]);
		console.log("Knowledge:", player[1].knowledge[player[1].knowledgeIndex]);
	}

}

// Decrease the selected character's stat by a certain amount
// TODO - Distribute damage between different attributes
function damage(player, stat, amount) {
	var statIndex = stat + "Index";
	var currVal = player[1][statIndex];
	currVal -= amount;

	// If haunting has been triggered, damage can be fatal
	if (currVal < 0) {
		if (haunting) {
			// Player is dead!
			console.log(player[0], "has died! :(");
		} else {
			currVal = 0;
		}
	}
	player[1][statIndex] = currVal;
}

// Increase the selected character's stat by a certain amount
function buff(player, stat, amount) {
	var statIndex = stat + "Index";
	var currVal = player[1][statIndex];
	currVal += amount;

	if (currVal > 7) {
		currVal = 7;
	}
	player[1][statIndex] = currVal;
}

// Roll selected amount of dice. Haunt rolls use 6 dice
function rollDice(amt) {
	var sum = 0;
	for (var i = 0; i < amt; i++) {
		sum += die[Math.floor(Math.random()*die.length)];
	}
	return sum;
}

// Check if there's a tile adjacent to the current one
function adjacent(currTile) {
	var x = currTile.xCoord;
	var y = currTile.yCoord;
	//console.log(currTile.name, "coordinates:", x, y);
	for (var i = 0; i < tilesInPlay.length; i++) {
		var x2 = tilesInPlay[i].xCoord;
		var y2 = tilesInPlay[i].yCoord;
		//console.log("The coordinates of", tilesInPlay[i].name, ":", x2, y2);
		if (x+80 == x2 && y == y2) {
			//console.log(currTile.name, "is to the left of", tilesInPlay[i].name);
			return [true, "right"];
		} else if (x-80 == x2 && y == y2) {
			//console.log(currTile.name, "is to the right of", tilesInPlay[i].name);
			return [true, "left"];
		} else if (y+80 == y2 && x == x2) {
			//console.log(currTile.name, "is on top of", tilesInPlay[i].name);
			return [true, "top"];
		} else if (y-80 == y2 && x == x2) {
			//console.log(currTile.name, "is under", tilesInPlay[i].name);
			return [true, "bottom"];
		}
	}
	return [false, null];
}

//var x = 0;
//var y = 0;
//var gate = true;
function draw() {
	/*******Debugging purposes********//*
	if (x != mouseX || y != mouseY) {
		if (x < 800 && y < 800) {
			console.log(mouseX, mouseY);
		}
	}
	x = mouseX;
	y = mouseY;/*
	if (gate) {
		console.log("The x-coord of the tile: ", tilesInPlay[0].xCoord);
		gate = false;
	}
	*//*********************************/

	// Check for hovering mouse near tiles
	for (var i = 0; i < tilesInPlay.length; i++) {
		if (!hovering) {
			var adj = adjacent(tilesInPlay[i]);
			if (adj[0]) {
				if (adj[1] == "right") {
					noFill();
					stroke(51);
					//rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
				}
				if (adj[1] == "left") {
					noFill();
					stroke(51);
					rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
					//rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
				}
				if (adj[1] == "top") {
					noFill();
					stroke(51);
					rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
					//rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
				}
				if (adj[1] == "bottom") {
					noFill();
					stroke(51);
					rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
					rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
					//rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
				}
			} else {
				noFill();
				stroke(51);
				rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
				rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
				rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
				rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
			}
		}
		// Check if mouse is on the right of the tile
		if (mouseX >= tilesInPlay[i].xCoord+35 && mouseX <= tilesInPlay[i].xCoord+115 &&
			mouseY >= tilesInPlay[i].yCoord-35 && mouseY <= tilesInPlay[i].yCoord+35) {
			console.log("Mouse is hovering over the right side of the", tilesInPlay[i].name);
			if (mouseX > 35 && mouseY > 35 && mouseX < 755 && mouseY < 755) {
				hovering = true;
				noFill();
				stroke(255);
				rect(tilesInPlay[i].xCoord+80, tilesInPlay[i].yCoord, 70, 70, 7);
			}

		// Check if mouse is on the left of the tile
		} else if (mouseX <= tilesInPlay[i].xCoord-35 && mouseX >= tilesInPlay[i].xCoord-115 &&
					mouseY >= tilesInPlay[i].yCoord-35 && mouseY <= tilesInPlay[i].yCoord+35) {
			console.log("Mouse is hovering over the left side of the", tilesInPlay[i].name);
			if (mouseX > 50 && mouseY > 35 && mouseX < 755 && mouseY < 755) {
				hovering = true;
				noFill();
				stroke(255);
				rect(tilesInPlay[i].xCoord-80, tilesInPlay[i].yCoord, 70, 70, 7);
			}

		// Check if mouse is on the top of the tile
		} else if (mouseX >= tilesInPlay[i].xCoord-35 && mouseX <= tilesInPlay[i].xCoord+35 &&
					mouseY <= tilesInPlay[i].yCoord-35 && mouseY >= tilesInPlay[i].yCoord-115) {
			console.log("Mouse is hovering over the top side of the", tilesInPlay[i].name);
			if (mouseX > 35 && mouseY > 50 && mouseX < 755 && mouseY < 755) {
				hovering = true;
				noFill();
				stroke(255);
				rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord-80, 70, 70, 7);
			}

		// Check if mouse is on the bottom of the tile
		} else if (mouseX >= tilesInPlay[i].xCoord-35 && mouseX <= tilesInPlay[i].xCoord+35 &&
					mouseY >= tilesInPlay[i].yCoord+35 && mouseY <= tilesInPlay[i].yCoord+115) {
			console.log("Mouse is hovering over the bottom side of the", tilesInPlay[i].name);
			if (mouseX > 35 && mouseY > 35 && mouseX < 755 && mouseY < 755) {
				hovering = true;
				noFill();
				stroke(255);
				rect(tilesInPlay[i].xCoord, tilesInPlay[i].yCoord+80, 70, 70, 7);
			}
		} else {
			hovering = false;
		}

	}
}
