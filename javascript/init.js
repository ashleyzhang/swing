var canvas;
var context;
var height;
var width;
const padding = 20;

// State of the game
var ball = {
	x: 0,
	y: 0,
    vx: 0, 
    vy: 0,
    radius: 5,
    color: "white",
	swing: {growth: Math.random() > 0.5},
    swingRadius: 0,
    swingAngle: 0,
    swingVelocity: 0
};
var swings = [];

var score = 0;

function init() {
	canvas = document.getElementById('swing');
	context = canvas.getContext('2d');
    canvas.height = window.innerHeight - padding;
    canvas.width = window.innerWidth - padding;
	height = canvas.offsetHeight;
	width = canvas.offsetWidth;

    startScreen();
    context.textAlign = "left";
	canvas.addEventListener("click", startGame);
    canvas.addEventListener("touchmove", startGame);
}

function startScreen() {
    context.rect(0, 0, width, height);
    context.fillStyle = "#7FFFD4";
    context.fill();
    context.font = "250px Courier";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Swing", width/2, height/2);
    context.font = "80px Verdana";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Click to Start", width/2, (height*3)/4);
}

// Begins the game and adds the listeners for user input
function startGame() {
    console.log("Game Started");
    // Initialize variables
    ball = {
        x: 10,
        y: height / 4,
        vx: 2, 
        vy: 0,
        radius: 5,
        color: "white",
        swing: null,
        swingRadius: 0,
        swingAngle: 0,
        swingVelocity: 0
    };
    initSwings(1);

    score = 0;

    canvas.removeEventListener("click", startGame);
    canvas.removeEventListener("touchmove", startGame);
    canvas.addEventListener("mousedown", attachToSwing);
    canvas.addEventListener("touchstart", attachToSwing);
    canvas.addEventListener("mouseup", detachFromSwing);
    canvas.addEventListener("touchend", detachFromSwing);
    nextFrame();
}

//
// Swing initializaton
//

// Initializes the swings
function initSwings(num) {
    swings = [];
	var positions = generateSwingPositions(num);
	positions.forEach(function(position) {
		swing = {
			x: position.x,
			y: position.y,
            acceleration: 0,
            radius: 0,
            life: 0,
            color: "black",
            growth: Math.random() > 0.5
		}
        swing.life = 5;
        swing.radius = getSwingRadius(swing.life);
        swing.color = getSwingColor(swing.life);
        swings.push(swing);
	});
}

// Generates the inital positions of the swings
function generateSwingPositions(num) {
	var positions = [];
	for (var i = 0; i < num; i++) {
        for (var j = 0; j < num; j++) {
    		positions.push({
    			x: (i + 0.5) * width / num,
    			y: (j + 0.5) * height / num
    		});
        }
	}
	return positions;
}
