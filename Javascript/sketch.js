/*
	TODO:
	->
	-> Display floor landings, remove from stack
*/

var characters = [];
var tiles = [];

function setup() {
	createCanvas(800, 800);
	background(51);
	//Basic alignment grid
	stroke(255);
	strokeWeight(0.5);
	line(width/2, 0, width/2, height);
	line(0, height/2, width, height/2);
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
	tiles = Object.entries(tile);

	var landingZone;
	for (var i = 0; i < tiles.length; i++) {
		if (tiles[i][0] == "Entrance_Hall") {
			landingZone = tiles[i];
			tiles.splice(i, 1);
			break;
		}
	}
	rect(width/2, height/2, 70, 70, 7);
	textSize(8.5);
	fill(255);
	text(landingZone[0].replace(/\_/g, " "), width/2-25, height/2-15);
}

// Gets random tile from stack, given current floor
function getTile(floor) {
	while (tiles.length > 0) {
		var tile = tiles[Math.floor(Math.random() * tiles.length)];
		if (tile[1].location.includes(floor)) {
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

// Damage the selected character's stat by a certain amount
function damage(player, stat, amount) {
	player[1][stat] = player[1][stat] - amount;
}

function draw() {

}
