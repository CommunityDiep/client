module.exports.grid = (ctx, x = 0, y = 0, width, height, slotSize = 24, fillColor = "#CDCDCD", lineColor = "#C6C6C6") => {
	ctx.fillStyle = fillColor === undefined ? "#cdcdcd" : fillColor;
	ctx.fillRect(x, y, width, height);
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.strokeColor = lineColor;
	ctx.lineWidth = 1;
	for (let i = 0; i < width || i < height; i += slotSize) {
		ctx.moveTo(0, i);
		ctx.lineTo(width, i);
		ctx.moveTo(i + (x % slotSize), 0);
		ctx.lineTo(i + (x % slotSize), height);
	}
	ctx.strokeStyle = lineColor;
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

/**
 * Gets the angle from the center of the screen.
 * @param {number} centerX The horizontal center coordinate of the screen.
 * @param {number} centerY The vertical center coordinate of the screen.
 * @param {MouseEvent} event The event.
 */
module.exports.getAngle = (centerX, centerY, event) => {
	return Math.atan2(centerX - event.clientX, centerY - event.clientY);
};

/**
 * Draws text.
 * @param {CanvasRenderingContext2D} ctx The canvas context to render the text on.
 * @param {number} x The X coordinate to render the text on.
 * @param {number} y The Y coordinate to render the text on.
 * @param {string} text The text to render.
 * @param {number} size The font size of the text.
 */
module.exports.drawText = (ctx, x = 0, y = 0, text, size) => {
	ctx.font = `bold ${size}px Ubuntu`;
	ctx.lineWidth = 4;
	ctx.textAlign = "center";

	ctx.save();
	ctx.translate(x, y);

	ctx.fillStyle = "#333333";
	ctx.strokeText(text, 0, 0);

	ctx.fillStyle = "white";
	ctx.fillText(text, 0, 0);

	ctx.restore();
};

/**
 * Converts degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function degToRad(deg) {
	return deg * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param {number} rad
 * @returns {number}
 */
module.exports.radToDeg = rad => {
	return rad * 180 / Math.PI;
};

/**
 * Draws a tank at a position on a canvas.
 * @param {CanvasRenderingContext2D} ctx The canvas context to render the tank on.
 * @param {number} x The X coordinate to render the tank on.
 * @param {number} y The Y coordinate to render the tank on.
 * @param {number} angle The angle of the tank in degrees.
 * @param {number} radius The radius of the tank.
 * @param {(string | CanvasGradient | CanvasPattern)} fillStyle The fill style for the tank's body.
 * @param {Object[]} barrels An array containing information for each of the tank's barrel.
 * @param {number} bodyType A number describing which body type to render the tank with.
 */
module.exports.drawTank = (ctx, x = 0, y = 0, angle = 0, radius = 15, fillStyle = "#1DB2DF", barrels = [], bodyType = 0) => {
	const animationTime = new Date().getTime();
	const color = fillStyle;

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(degToRad(angle));
	ctx.scale(radius / 48, radius / 48);

	ctx.lineJoin = "round";
	ctx.strokeStyle = "#555555";
	ctx.fillStyle = "#999999";
	ctx.lineWidth = 4 / (radius / 48);

	barrels.forEach((leBarrel, i) => {
		if (barrels[i].barrelType == 0) {
			ctx.save();
			ctx.rotate(degToRad(barrels[i].angle));
			ctx.fillRect(0, (48 - barrels[i].width) - 48 + barrels[i].offsetX,
				barrels[i].length * 2, barrels[i].width * 2);
			ctx.strokeRect(0, (48 - barrels[i].width) - 48 + barrels[i].offsetX,
				barrels[i].length * 2, barrels[i].width * 2);
			ctx.restore();
		} else if (barrels[i].barrelType == 1) {
			ctx.save();
			ctx.rotate(degToRad(barrels[i].angle));
			ctx.beginPath();
			ctx.moveTo(0, ((-1 * barrels[i].width) / 2) + barrels[i].offsetX);
			ctx.lineTo(barrels[i].length * 2, ((-1 * barrels[i].width * 2) / 2) +
				barrels[i].offsetX);
			ctx.lineTo(barrels[i].length * 2, ((barrels[i].width * 2) / 2) + barrels[
				i].offsetX);
			ctx.lineTo(0, ((barrels[i].width) / 2) + barrels[i].offsetX);
			ctx.lineTo(0, ((-1 * barrels[i].width) / 2) + barrels[i].offsetX);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}
	});
	ctx.rotate(0);
	ctx.lineWidth = 4 / (radius / 48);
	if (bodyType == 0) {
		ctx.beginPath();
		ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.strokeStyle = "#555555";
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "#000000";
	} else if (bodyType == 1) {
		ctx.fillStyle = color;
		ctx.strokeStyle = "#555555";
		ctx.fillRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
		ctx.strokeRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
	} else if (bodyType == 2) {
		ctx.beginPath();
		ctx.fillStyle = "#555555";
		ctx.strokeStyle = "#555555";
		ctx.lineJoin = "round";
		var hA = ((Math.PI * 2) / 6);
		ctx.moveTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
			6) % 360)) * 58, Math.sin((hA * hI) - degToRad(angle) + degToRad((
			animationTime / 6) % 360)) * 58);
		for (var hI = 1; hI < 8; hI++) {
			ctx.lineTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
				6) % 360)) * 58, Math.sin((hA * hI) - degToRad(angle) + degToRad((
				animationTime / 6) % 360)) * 58);
		}
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.strokeStyle = "#555555";
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "#000000";
	} else if (bodyType == 3) {
		ctx.beginPath();
		ctx.fillStyle = "#555555";
		ctx.strokeStyle = "#555555";
		ctx.lineJoin = "round";
		var hA = ((Math.PI * 2) / 3);
		ctx.moveTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
			3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle) + degToRad((
			animationTime / 3) % 360)) * 64);
		for (var hI = 1; hI < 5; hI++) {
			ctx.lineTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
				3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle) + degToRad((
				animationTime / 3) % 360)) * 64);
		}
		ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 90) + degToRad((
			animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
			90) + degToRad((animationTime / 3) % 360)) * 64);
		for (var hI = 1; hI < 5; hI++) {
			ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 90) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
				angle - 90) + degToRad((animationTime / 3) % 360)) * 64);
		}
		ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 180) + degToRad((
			animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
			180) + degToRad((animationTime / 3) % 360)) * 64);
		for (var hI = 1; hI < 5; hI++) {
			ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 180) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
				angle - 180) + degToRad((animationTime / 3) % 360)) * 64);
		}
		ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 270) + degToRad((
			animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
			270) + degToRad((animationTime / 3) % 360)) * 64);
		for (var hI = 1; hI < 5; hI++) {
			ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 270) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
				angle - 270) + degToRad((animationTime / 3) % 360)) * 64);
		}
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.strokeStyle = "#555555";
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "#000000";
	}

	ctx.restore();
};