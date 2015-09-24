function nextFrame() {
	drawFrame();
	if ((ball.x < ball.radius || ball.x > width - ball.radius || ball.y < ball.radius || ball.y > height - ball.radius) && ball.swing === null) {
		addSwing();
	}
	if (ball.swing !== null && distance(ball, ball.swing) <= ball.swingRadius + 0.5) {
		swingMove();
	}
	else {
		freeMove();
	}
	if (!gameOver()) {
		setTimeout(nextFrame, 0.5);
	}
	else {
		canvas.addEventListener("click", startGame);
		canvas.addEventListener("touchmove", startGame);
		canvas.removeEventListener("mousedown", attachToSwing);
		canvas.removeEventListener("touchstart", attachToSwing);
		canvas.removeEventListener("mouseup", detachFromSwing);
		canvas.removeEventListener("touchend", detachFromSwing);
	}
}

//
// Drawing functions
//

// Responsible for drawing the ball and swings
function drawFrame() {
	// Clear the canvas before drawing
	context.clearRect(0, 0, width, height);

	// Change background color
	context.rect(0, 0, width, height);
    context.fillStyle = "#7FFFD4";
    context.fill();

	// Draw the outline of the swing radius if attached to a swing
	if (ball.swing !== null) {
		drawCircle(ball.swing.x, ball.swing.y, ball.swingRadius, "#A9A9A9", false)
		drawLine(ball.x, ball.y, ball.swing.x, ball.swing.y, "#FFFFF0");
	}

	// Draws swings and ball
	swings.forEach(function(swing) {
		drawCircle(swing.x, swing.y, swing.radius, swing.color, true);
	});
	drawCircle(ball.x, ball.y, ball.radius, ball.color, true);

	// Draw score
	drawText(10, 30, score);
}

// Draws a circle on the canvas with either fill or stroke
function drawCircle(x, y, radius, color, fill) {
	context.beginPath();
	context.fillStyle = color;
	context.strokeStyle = color;
	context.arc(x, y, radius, 0, Math.PI * 2, true); 
	context.closePath();
	if (fill) {
		context.fill();
	}
	else {
		context.stroke();
	}
}

function drawLine(x1, y1, x2, y2, color) {
	context.beginPath();
	context.strokeStyle = color;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.closePath();
	context.stroke();
}

function drawText(x, y, text) {
	context.font = "30px Arial";
	context.fillText(text, x, y);
}

//
// Movement functions
//

// Moves ball when not attached to any swing
function freeMove() {
	// Bounce off walls
	if (ball.x < ball.radius && ball.x > -ball.radius) {
		ball.x = ball.radius;
		ball.vx *= -1;
	}
	if (ball.x > width - ball.radius && ball.x < width + ball.radius) {
		ball.x = width - ball.radius;
		ball.vx *= -1;
	}
	if (ball.y < ball.radius && ball.y > -ball.radius) {
		ball.y = ball.radius;
		ball.vy *= -1;
	}
	if (ball.y > height - ball.radius && ball.y < height + ball.radius) {
		ball.y = height - ball.radius;
		ball.vy *= -1;
	}

	// Update position
	ball.x += ball.vx;
	ball.y += ball.vy;
}

// Moves ball when attached to swing
function swingMove() {
	ball.swingVelocity += (ball.swingVelocity > 0) ? ball.swing.acceleration : -ball.swing.acceleration;

	// Setting ball position
	ball.swingAngle += ball.swingVelocity;
	ball.x = ball.swing.x + ball.swingRadius * Math.cos(ball.swingAngle);
	ball.y = ball.swing.y + ball.swingRadius * Math.sin(ball.swingAngle);

	// Setting ball velocity
	var releaseAngle = ball.swingAngle + Math.PI / 2;
	var speed = ball.swingVelocity * ball.swingRadius;
	ball.vx = speed * Math.cos(releaseAngle);
	ball.vy = speed * Math.sin(releaseAngle);

	// Updating swing
	// Can be either increasing or decreasing
	updateSwing(ball.swing.growth);
	var x = 0.00000000001;
	if(ball.swing !== null){
		ball.swing.acceleration = Math.sqrt(x);
		x+=0.00000000001;
	}
}

function updateSwing(increasing) {
	var increment = Math.abs(ball.swingVelocity / (2 * Math.PI));
	if(increasing) {
		ball.swing.life += (increment*3);
	}
	else {
		ball.swing.life -= (increment*3);
	}
	score += Math.ceil(increment * 1000);
	ball.swing.radius = getSwingRadius(ball.swing.life);
	ball.swing.color = getSwingColor(ball.swing.life);
	if (ball.swing.life <= 0) {
		swings.splice(swings.indexOf(ball.swing), 1);
		ball.swing = null;
	}
}

function getSwingRadius(life) {
	return 3 + (3 * life);
}

function getSwingColor(life) {
	return "grey";
}

// Finds the closest swing to the ball and attaches it
function attachToSwing() {
	var minDistance = Infinity;
	swings.forEach(function(swing) {
		var dis = distance(ball, swing);
		if (dis < minDistance) {
			ball.swing = swing;
			minDistance = dis;
		}
	});
	setSwingParams();
}

function setSwingParams() {
	// Get equations in form y = Ax + B
	var ballA = ball.vy / ball.vx;
	var ballB = ball.y - (ballA * ball.x);
	var x = ball.swing.x;
	if (ballA !== 0) {
		var swingA = -1 / ballA;
		var swingB = ball.swing.y - (swingA * ball.swing.x);
		x = (swingB - ballB) / (ballA - swingA);
	}
	var y = (ballA * x) + ballB;
	ball.swingRadius = distance({ x: x, y: y }, ball.swing);
	ball.swingAngle = Math.atan2(y - ball.swing.y, x - ball.swing.x);
	if (!movingTowardsSwing()) {
		ball.swingRadius = distance(ball, ball.swing);
		ball.swingAngle = Math.atan2(ball.y - ball.swing.y, ball.x - ball.swing.x);
	}
	ball.swingVelocity = Math.sqrt(Math.pow(ball.vx, 2) + Math.pow(ball.vy, 2)) / ball.swingRadius;
	if (clockwise(x, y)) {
		ball.swingVelocity *= -1;
	}
}

function movingTowardsSwing() {
	var movedBall = { x: ball.x + ball.vx, y: ball.y + ball.vy };
	return distance(movedBall, ball.swing) < distance(ball, ball.swing);
}

// Horrible function to determine if the ball is going clockwise
// TODO: Find a better way to do this
function clockwise(x, y) {
	var ballQuadrant = 0;
	var swingQaudrant = 0;
	var ballX = ball.vx;
	var ballY = ball.vy;
	var swingX = x - ball.swing.x;
	var swingY = y - ball.swing.y;
	if (ballX > 0 && ballY >= 0) {
		ballQuadrant = 1;
	}
	else if (ballX <= 0 && ballY > 0) {
		ballQuadrant = 2;
	}
	else if (ballX < 0 && ballY <= 0) {
		ballQuadrant = 3;
	}
	else {
		ballQuadrant = 4;
	}
	if (swingX > 0 && swingY >= 0) {
		swingQuadrant = 1;
	}
	else if (swingX <= 0 && swingY > 0) {
		swingQuadrant = 2;
	}
	else if (swingX < 0 && swingY <= 0) {
		swingQuadrant = 3;
	}
	else {
		swingQuadrant = 4;
	}
	if (swingQuadrant - ballQuadrant === 1 || (swingQuadrant == 1 && ballQuadrant == 4)) {
		return true;
	}
	return false;
}

// Detaches the ball from its swing
function detachFromSwing() {
	ball.swing = null;
	ball.swingRadius = 0;
	ball.swingAngle = 0;
	ball.swingVelocity = 0;
}


function addSwing() {
	console.log("addSwing");
	var swing = {
		x: ball.x,
		y: ball.y,
		acceleration: 0,
        radius: 0,
        life: 0,
        color: "black",
        growth: Math.random() > 0.5
	}
	swing.life = 5;
    swing.radius = getSwingRadius(swing.life);
    swing.color = getSwingColor(swing.life);

	var isValidSwingPosition = function(newSwing) {
		var minDistance = 75;
		var isValid = true;
		var slope = ball.vy / ball.vx;
		if (distance(ball, newSwing) < minDistance || ball.swingRadius <= newSwing.swingRadius) {
			isValid = false;
		}
		swings.forEach(function(swing) {
			if (distance(swing, newSwing) < minDistance) {
				isValid = false;
			}
		});
		return isValid;
	};
	
	var tries = 0;
	while (!isValidSwingPosition(swing) && tries < 200) {
		swing.x = Math.random() * (width - 100) + 50;
		swing.y = Math.random() * (height - 100) + 50;
	}
	if (isValidSwingPosition(swing)) {
		
		swings.push(swing);
	}
}

// Game is over if the ball hits a swing or a wall.

function endScreen() {
	context.clearRect(0, 0, width, height);
	context.fillStyle = "#7FFFD4";
	context.fillRect(0, 0, width, height);
    context.font = "100px Verdana";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Game Over", width/2, height/3);
    context.font = "80px Verdana";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Score: " + score, width/2, height/2);
    context.font = "90px Verdana";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Click to Play Again", width/2, (height*3)/4);
}

function gameOver() {
	var isGameOver = false;
	swings.forEach(function(swing) {
		if (distance(ball, swing) < ball.radius + swing.radius) {
			isGameOver = true;
		}
	});
	if ((ball.x < -ball.radius || ball.x > width + ball.radius || ball.y < -ball.radius || ball.y > height + ball.radius) && ball.swing === null) {
		isGameOver = true;
	}
	if (isGameOver) {
		console.log("Game Over");
		endScreen();
		context.textAlign = "left";
	}
	return isGameOver;
}

// Calculate euclidian distance from obj1 to obj2
function distance(obj1, obj2) {
	return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}
