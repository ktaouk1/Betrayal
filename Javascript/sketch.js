/*
	TODO:
	-> Character stats starting indexes
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
	textSize(12);
	text(landingZone[0], width/2-25, height/2-15);
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

function draw() {

}
