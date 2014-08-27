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

var method1 = function () {
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

var method2 = function () {
	// Size the buffer to allow for outline
	var strokeWidth = 2;
	buffer.width = sprite.width + strokeWidth * 4;
	buffer.height = sprite.height + strokeWidth * 4;

	// Create a second buffer to hold pixel edits
	// We don't want the outline pixels screwing with our calculations
	var buffer2 = document.createElement("canvas");
	buffer2.width = buffer.width;
	buffer2.height = buffer.height;
	var bctx2 = buffer2.getContext("2d");

	// Draw the original sprite centered on the "read" buffer
	var dx = Math.round(buffer.width / 2 - sprite.width / 2);
	var dy = Math.round(buffer.height / 2 - sprite.height / 2);
	bctx.drawImage(
		sprite,
		0, 0, sprite.width, sprite.height,
		dx, dy, sprite.width, sprite.height
	);

	// Copy it exactly to the "write" buffer
	bctx2.drawImage(
		buffer,
		0, 0, buffer.width, buffer.height,
		0, 0, buffer.width, buffer.height
	);

	// Offsets for calculating neighbor coordinates
	var size = 4;
	var offsets = [
		-buffer.width * size, // Top
		-buffer.width * size - size, // Top left
		-buffer.width * size + size, // Top right
		buffer.width * size, // Bottom
		buffer.width * size - size, // Bottom left
		buffer.width * size + size, // Bottom right
		-size, // Left
		size // Right
	];

	// Execute the outlining N times for desired thickness of outline
	for (var n = 0; n < strokeWidth; ++n) {
		// Grab references to the "read" and "write" buffer image data
		var imageData = bctx.getImageData(0, 0, buffer.width, buffer.height);
		var imageData2 = bctx2.getImageData(0, 0, buffer2.width, buffer2.height);
		var data = imageData.data;

		// For each pixel in the buffer, evaluate and add outline if needed
		for (var i = 0; i < data.length; i += size) {
			var r = data[i];
			var g = data[i + 1];
			var b = data[i + 2];
			var a = data[i + 3];

			// Check if the pixel is question is transparent
			if ((r + g + b + a) !== 0) {
				// Not transparent, set the pixel to our outline color (255, 0, 255)
				imageData2.data[i] = 255;
				imageData2.data[i + 1] = 0;
				imageData2.data[i + 2] = 255;
				imageData2.data[i + 3] = 255;
				continue;
			}

			// For each neighboring pixel, check for transparency
			for (var k = 0; k < offsets.length; ++k) {
				var index = i + offsets[k];
				if (index < 0 || index > data.length - 1) { continue; }

				var r = data[index];
				var g = data[index + 1];
				var b = data[index + 2];
				var a = data[index + 3];

				if ((r + g + b + a) !== 0) {
					// If *ANY* neighboring pixels are non-transparent
					// set this pixel to be our outline color
					imageData2.data[i] = 255;
					imageData2.data[i + 1] = 0;
					imageData2.data[i + 2] = 255;
					imageData2.data[i + 3] = 255;
					break;
				}
			}
		}

		// Copy the "write" buffer to the "read" buffer so we can start again
		bctx.putImageData(imageData2, 0, 0);
	}

	// Draw the original sprite back to the buffer again
	bctx.drawImage(
		sprite,
		0, 0, sprite.width, sprite.height,
		dx, dy, sprite.width, sprite.height
	);

	// Finally, draw the entire buffer to the screen
	ctx.drawImage(
		buffer,
		0, 0, buffer.width, buffer.height,
		100, 0, buffer.width, buffer.height
	);
};

var render = function () {
	method1();
	method2();
};
