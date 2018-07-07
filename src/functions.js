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