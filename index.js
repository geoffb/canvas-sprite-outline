// Create the main stage
var stage = document.createElement("canvas");
stage.width = 200;
stage.height = 200;
document.body.appendChild(stage);
var ctx = stage.getContext("2d");

// Create a buffer used for compositing
var buffer = document.createElement("canvas");
var bctx = buffer.getContext("2d");

// Load the sprite and render when loading has completed
var sprite = new Image();
sprite.onload = function () {
	render();
};
sprite.src = "raga.png";

var render = function () {
	// First, size the buffer to match the sprite size * scale
	var bufferScale = 1.1;
	var bufferWidth = Math.round(sprite.width * bufferScale);
	var bufferHeight = Math.round(sprite.height * bufferScale);
	buffer.width = bufferWidth;
	buffer.height = bufferHeight;

	// Next, draw the sprite scaled up to the buffer
	bctx.drawImage(
		sprite,
		0, 0, sprite.width, sprite.height,
		0, 0, bufferWidth, bufferHeight
	);

	// Mask the sprite with a solid color using compositing
	bctx.globalCompositeOperation = "source-in";
	bctx.fillStyle = "rgb(255, 0, 255)";
	bctx.fillRect(0, 0, bufferWidth, bufferHeight);

	// Now, draw the original sprite centered within the buffer
	var dx = Math.round(bufferWidth / 2 - sprite.width / 2);
	var dy = Math.round(bufferHeight / 2 - sprite.height / 2);
	bctx.globalCompositeOperation = "source-over";
	bctx.drawImage(
		sprite,
		0, 0, sprite.width, sprite.height,
		dx, dy, sprite.width, sprite.height
	);

	// Finally, draw the buffer to the screen
	ctx.drawImage(
		buffer,
		0, 0, bufferWidth, bufferHeight,
		0, 0, bufferWidth, bufferHeight
	);
};
