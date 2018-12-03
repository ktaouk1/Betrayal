/*
	TODO:
	->
	->
*/

function setup() {
	createCanvas(800, 800);
	background(51);

	// Load character data
	var characters = (function() {
		var json = null;
		$.ajax({
			'async' : false,
			'global' : false,
			'url' : "/characters.json",
			'dataType' : "json",
			'success' : function (data) {
				json = data;
			}
		});
		return json;
	})();
	characters = Object.entries(characters);
	console.log(characters);
}

function draw() {

}
