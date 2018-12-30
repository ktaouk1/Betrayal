/*
	TODO:
	->
	-> Display floor landings, remove from stack
*/

var characters = [];
var tiles = [];
var players = [];

function setup() {


	/* INITIALISE DATA AND VARIABLES */


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

	//Light and dark theme buttons
	var lighttheme = document.getElementById("light").addEventListener("click", function() {
		var info = document.getElementById("info");
		var actions = document.getElementById("actions");
		var title = document.getElementById("title");
		var body = document.getElementById("body");
		info.style.backgroundColor = "#eee";
		info.style.borderColor = "rgb(51, 51, 51)";
		info.style.color = "rgb(51, 51, 51)";
		actions.style.backgroundColor = "#eee";
		actions.style.borderColor = "rgb(51, 51, 51)";
		actions.style.color = "rgb(51, 51, 51)";
		title.style.color = "rgb(51, 51, 51)";
		body.style.backgroundColor = "white";
	});
	var darktheme = document.getElementById("dark").addEventListener("click", function() {
		var info = document.getElementById("info");
		var actions = document.getElementById("actions");
		var title = document.getElementById("title");
		var body = document.getElementById("body");
		info.style.backgroundColor = "rgb(27, 29, 31)";
		info.style.borderColor = "rgb(86, 85, 83)";
		info.style.color = "rgb(230, 226, 219)";
		actions.style.backgroundColor = "rgb(27, 29, 31)";
		actions.style.borderColor = "rgb(86, 85, 83)";
		actions.style.color = "rgb(230, 226, 219)";
		title.style.color = "rgb(230, 226, 219)";
		body.style.backgroundColor = "rgb(24, 25, 26)";
	});


	/* VISUALISE BOARD TILES
		This includes:
			> Checking the amount of free doors a tile has
			> Selecting a new tile from the stack
			> Drawing the tile at a random free position
	*/


	// TEMPORARY TILE CODE
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


	/* GAMEPLAY */


	// Get 4 random players for the game..
	var temp = characters;
	for (var i = 0; i < 4; i++) {
		var index = Math.floor(Math.random() * temp.length);
		var player = temp[index];
		temp.splice(index, 1);
		players.push(player);
	}

	//para.textContent += ;
	//Introductory message
	var para = document.getElementById("news");
	para.textContent += "Welcome to Betrayal at House on the Hill! These are our players:\r\n\r\n";
	//Display 4 random playable characters
	for (var i = 0; i < players.length; i++) {
		console.log(players[i]);
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
			actions.textContent += this.id.replace(/\_/g, " ") + "\r\n\r\n";
			var speed = "Speed: ";
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
			actions.textContent += speed + "\r\n" + might + "\r\n" + sanity + "\r\n" + knowledge + "\r\n";
		});
		actions.appendChild(btn);
	}
	console.log(getTile("upper"));
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
