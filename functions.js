function calculateBarrelPos(angle) {
	let xPos = Math.cos(angle / 180 * Math.PI) * 15;
	let yPos = Math.sin(angle / 180 * Math.PI) * 15;
	return {
		x: xPos,
		y: yPos,
	};
}

const bodyIndexToName = ["circular", "square", "smasher", "spike"];
function drawTank(obj) {
	let x = obj.x;
	let y = obj.y;
	let angle = obj.angle;
	let radius = obj.radius;
	let color = obj.bodyColor;
	let barrels = obj.barrels;
	let bodyType = obj.bodyType === "number" ? {
		type: bodyIndexToName[obj.bodyType]
	 } : obj.bodyType;
	let hat = obj.showHatSecret || true;

	let animationTime = new Date().getTime()
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(degToRad(angle));
	ctx.scale(radius / 48, radius / 48);
	ctx.lineJoin = 'round';
	ctx.strokeStyle = softStroke ? shadeColor('#999999', -0.25) : '#555555';
	ctx.fillStyle = '#999999';
	ctx.lineWidth = 4 / (radius / 48);
	for (let i = 0; i < barrels.length; i++) {
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
		};
	};
	ctx.rotate(0);
	ctx.lineWidth = 4 / (radius / 48);

	switch (bodyType.type) {
		case "square":
			ctx.fillStyle = color;
			ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
			ctx.fillRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
			ctx.strokeRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
		
		case "smasher":
			ctx.beginPath();
			ctx.fillStyle = '#555555';
			ctx.strokeStyle = '#555555';
			ctx.lineJoin = 'round';
			var hA = ((Math.PI * 2) / 6);
			ctx.moveTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
				6) % 360)) * 58, Math.sin((hA * hI) - degToRad(angle) + degToRad((
					animationTime / 6) % 360)) * 58);
			for (var hI = 1; hI < 8; hI++) {
				ctx.lineTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
					6) % 360)) * 58, Math.sin((hA * hI) - degToRad(angle) + degToRad((
						animationTime / 6) % 360)) * 58);
			};
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = '#000000';
			break;

		case "spike":
			ctx.beginPath();
			ctx.fillStyle = '#555555';
			ctx.strokeStyle = '#555555';
			ctx.lineJoin = 'round';
			var hA = ((Math.PI * 2) / 3);
			ctx.moveTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
				3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle) + degToRad((
					animationTime / 3) % 360)) * 64);
			for (var hI = 1; hI < 5; hI++) {
				ctx.lineTo(Math.cos((hA * hI) - degToRad(angle) + degToRad((animationTime /
					3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle) + degToRad((
						animationTime / 3) % 360)) * 64);
			};
			ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 90) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
					90) + degToRad((animationTime / 3) % 360)) * 64);
			for (var hI = 1; hI < 5; hI++) {
				ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 90) + degToRad((
					animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
						angle - 90) + degToRad((animationTime / 3) % 360)) * 64);
			};
			ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 180) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
					180) + degToRad((animationTime / 3) % 360)) * 64);
			for (var hI = 1; hI < 5; hI++) {
				ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 180) + degToRad((
					animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
						angle - 180) + degToRad((animationTime / 3) % 360)) * 64);
			};
			ctx.moveTo(Math.cos((hA * hI) - degToRad(angle - 270) + degToRad((
				animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(angle -
					270) + degToRad((animationTime / 3) % 360)) * 64);
			for (var hI = 1; hI < 5; hI++) {
				ctx.lineTo(Math.cos((hA * hI) - degToRad(angle - 270) + degToRad((
					animationTime / 3) % 360)) * 60, Math.sin((hA * hI) - degToRad(
						angle - 270) + degToRad((animationTime / 3) % 360)) * 64);
			};
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = '#000000';
			break;

		case "circular":
		default:
			ctx.beginPath();
			ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = '#000000';
			break;
	}

	if (hat && date.getMonth() == 11 && date.getDate() == 25) {
		ctx.rotate(5.6);
		ctx.drawImage(hatImage, -5 - radius, -105 - radius, radius * 5, radius * 5);
		ctx.rotate(-5.6);
	}

	ctx.restore();
};

function tryJoin() {
	if (input.value != '') {
		let ip = 104024 * Math.random();
		socket.emit('signIn', {
			name: input.value,
			address: ip,
			tank: 'basic',
			width: width,
			height: height
		});
		localStorage.setItem("username", input.value || "");
	}
}

/**
 * Draw Diep.io-styled text in object form.
 * @param {Object} obj - The object containing all the text data.
 * @param {string} obj.text - The text to draw.
 * @param {number} obj.x - X position of the text center.
 * @param {number} obj.y - Y position of the text center.
 * @param {number} [obj.maxSize=200] - The maximum width the text can go before condensing.
 * @param {number} [obj.opacity] - The opacity of the text.
 * @param {string} [obj.color=white] - The color of the text.
 * @param {string} [obj.strokeColor=#333333] - The color of the text's stroke.
 * @param {string} [obj.font] - The font to draw the text in.
 */
function drawText(obj) {
	ctx.globalAlpha = obj.opacity == undefined ? 1 : obj.opacity;
	ctx.font = obj.font == undefined ? ctx.font == undefined ? '20px Ubuntu' :
		ctx.font : obj.font;
	obj.maxSize = obj.maxSize == undefined ? 200 : obj.maxSize;
	ctx.lineWidth = 4;
	ctx.textAlign = 'center';
	ctx.save();
	ctx.translate(obj.x, obj.y);
	ctx.fillStyle = obj.strokeColor == undefined ? '#333333' : obj.strokeColor;
	ctx.strokeText(obj.text, 0, 0, obj.maxSize);
	ctx.fillStyle = obj.color == undefined ? 'white' : obj.color;
	ctx.fillText(obj.text, 0, 0, obj.maxSize);
	ctx.restore();
};

function degToRad(deg) {
	return deg * (Math.PI / 180);
}

function drawPolygon(obj) {
	ctx.save();
	ctx.fillStyle = obj.color;
	ctx.strokeStyle = softStroke ? shadeColor(obj.color, -0.25) : '#555555';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	let step = ((Math.PI * 2) / obj.sides);
	ctx.translate(obj.x, obj.y);
	ctx.rotate(degToRad(obj.angle));
	ctx.moveTo(obj.radius * 2, 0);
	for (let i = 1; i < obj.sides + 2; i++) {
		ctx.lineTo(2 * obj.radius * Math.cos(step * i), 2 * obj.radius * Math.sin(step * i));
	}
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};
let Shape = function(initPack) {
	let self = {}
	self.id = initPack.id;
	self.x = initPack.x;
	self.y = initPack.y;
	self.angle = initPack.angle;
	self.name = initPack.name;
	self.color = initPack.color;
	self.colorname = initPack.colorname;
	self.hp = initPack.hp;
	self.hpPercent = initPack.hpPercent;
	self.draw = function() {
		if (Math.abs(Player.list[selfId].x - self.x) > width / 2 + 50 || Math.abs(
				Player.list[selfId].y - self.y) > height / 2 + 50) {
			return;
		}
		let x = self.x - Player.list[selfId].x + width / 2;
		let y = self.y - Player.list[selfId].y + height / 2;
		switch (self.name) {
			case "secret-shape1":
				/*
				drawPolygon(x, y, self.angle, 17, self.color, 10);
				drawPolygon(x, y, self.angle, 15, self.color, 9);
				drawPolygon(x, y, self.angle, 13, self.color, 8);
				drawPolygon(x, y, self.angle, 11, self.color, 7);
				drawPolygon(x, y, self.angle, 9, self.color, 6);
				*/

				console.log("This shape is deprecated. hahah i'm so funny");
				break;
			case "triangle":
				drawPolygon({
					x: x,
					y: y,
					angle: self.angle,
					radius: 9,
					color: self.color,
					sides: 3
				});

				break;
			case "alphapentagon":
				drawPolygon({
					x: x,
					y: y,
					angle: self.angle,
					radius: 50,
					color: self.color,
					sides: 5
				});

				break;
			case "pentagon":
				drawPolygon({
					x: x,
					y: y,
					angle: self.angle,
					radius: 17,
					color: self.color,
					sides: 5
				});

				break;
			case "square":
			default:
				drawPolygon({
					x: x,
					y: y,
					angle: self.angle + 45,
					radius: 10,
					color: self.color,
					sides: 4
				});

				break;
		}
	}
	Shape.list[self.id] = self;
	return self;
}

function drawGrid(x, y, width, height, slotSize, fillColor, lineColor, xOffset, yOffset) {
	ctx.fillStyle = fillColor === undefined ? '#cdcdcd' : fillColor;
	ctx.fillRect(x, y, width, height);
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.strokeColor = lineColor;
	ctx.lineWidth = 1;
	for (let i = 0; i < width || i < height; i += slotSize) {
		ctx.moveTo(0, i);
		ctx.lineTo(width, i);
		ctx.moveTo(i + (xOffset % slotSize), 0);
		ctx.lineTo(i + (xOffset % slotSize), height);
	};
	ctx.strokeStyle = lineColor;
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
}

function drawClickArea(obj) {
	ctx.save();

	ctx.globalAlpha = obj.opacity === undefined ? 0.9 : obj.opacity;
	ctx.lineJoin = 'round';

	ctx.lineWidth = obj.strokeWidth === undefined ? 2.5 : obj.strokeWidth;
	ctx.strokeStyle = obj.strokeColor === undefined ? '#333333' : obj.strokeColor;

	ctx.fillStyle = obj.color;

	ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
	ctx.fillStyle = '#000000';
	ctx.globalAlpha = 0.2;
	ctx.fillRect(obj.x, obj.y + (obj.height / 2), obj.width, obj.height / 2);
	ctx.globalAlpha = 1;
	ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
	if (typeof obj.tankData !== 'string') {
		ctx.globalAlpha = 1;
		drawTank({
			x: obj.x + (obj.width / 2),
			y: obj.y + (obj.height / 2),
			angle: spin_angle,
			radius: obj.width / 5,
			bodyColor: '#1DB2DF',
			barrels: obj.tankData.barrels,
			bodyType: obj.tankData.body
		});
	}
	drawText({
		text: typeof obj.tankData == 'string' ? obj.tankData : obj.tankData.localized,
		x: obj.x + (obj.width / 2),
		y: obj.y + obj.height - 8,
		font: `${obj.width / 7}px Ubuntu`,
		maxSize: obj.width - 3
	});
	ctx.restore();
};

function drawUpgrades() {
	let selfPlayer = Player.list[selfId];
	let selfTankUpgrades = tanktree[selfPlayer.tank].upgrades;

	function nfup(pos) {
		let uptank = tanktree[Object.keys(tanktree[selfPlayer.tank].upgrades)[
			pos]];
		if (uptank == undefined) {
			return undefined;
		} else {
			if (uptank.barrels == undefined) {
				uptank.barrels = [];
			}
			if (uptank.body == undefined) {
				uptank.body = 0;
			}
			return uptank;
		}
	}

	function stfup(pos) {
		return Object.values(selfTankUpgrades)[pos] <= selfPlayer.tier;
	}
	if (selfPlayer.tier && ![undefined, null, {},
			[]
		].includes(selfTankUpgrades)) {
		for (let index = 0; index < Object.keys(selfTankUpgrades).length; index++) {
			let slotX = 10 + 86.25 * (index % 2);
			let slotY = index % 2 === 1 ? 103 + 86.25 * (index / 2 - 1) : 60 + 86.25 * index / 2;

			if (nfup(index) !== undefined && stfup(index)) {
				drawClickArea({
					x: slotX,
					y: slotY,
					width: 80,
					height: 80,
					color: uiColors[index],
					tankData: nfup(index)
				});

				hitRegions.push({
					x: slotX,
					y: slotY,
					width: 80,
					height: 80,
					activate: function(pos) {
						socket.emit('upgrade', {
							pos: pos
						});
					}
				});
			}
		}
		drawClickArea({
			x: 98,
			y: 626,
			width: 100,
			height: 30,
			color: '#b0b0b0',
			tankData: 'Ignore'
		});
		drawText({
			text: 'Upgrades',
			x: 138,
			y: 40,
			opacity: '1',
			font: 'bold 20px Ubuntu'
		});
	}
};

function drawCircle(x, y, radius, color, trap) {
	color = color == undefined ? '#1DB2DF' : color;
	if (trap == 'trap') {
		let radius = 0; // for some reason it's 0?
		ctx.save();
		ctx.lineWidth = 4;
		ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
		ctx.fillStyle = color;
		ctx.translate(x, y)
		ctx.beginPath();
		ctx.lineJoin = 'round';
		var hA = ((Math.PI * 2) / 3);
		ctx.moveTo(Math.cos(hA * hI) * radius, Math.sin(hA * hI) * radius);
		for (var hI = 1; hI < 5; hI++) {
			ctx.lineTo(Math.cos(hA * hI) * radius, Math.sin(hA * hI) * radius);
			ctx.lineTo(Math.cos((hA * hI) + (hA / 2)) * (radius / 3.5), Math.sin((hA *
				hI) + (hA / 2)) * (radius / 3.5));
		};
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	} else {
		ctx.save();
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}
};

function addStatusMessage(data) {
	let index = statusMessages.length;
	statusMessages[index] = data;

	setTimeout(function() {
		delete statusMessages[index];
	}, 2200);
}

function drawServerSelectorUI() {
	ctx.fillStyle = 'white';
	drawClickArea({
		x: canvas.width / 2 - 300,
		y: canvas.height / 2 - 200,
		width: 600,
		height: 400,
		tankData: "",
		opacity: 1
	})
}

function drawStatusMessages() {
	for (let item of statusMessages) {
		if (item !== undefined) {
			ctx.globalAlpha = 0.7;

			drawText({
				opacity: 1,
				text: item.message,
				x: canvas.width / 2,
				y: 20,
				font: "10px Ubuntu"
			})
		};
	};
}
// Replace this with drawServerInfo soon.
// The new function will include player count/server name,
// but will look more like Diep.io's bottom-right corner text.
function drawPlayerCount() {
	let players = Object.keys(Player.list).length
	let plural = Object.keys(Player.list).length == 1 ? '' : 's';
	drawText({
		text: `${Object.keys(Player.list).length} player${plural} on this server`,
		x: width - 190,
		y: height - 50,
		font: 'bold 30px Ubuntu'
	});
};

function drawHotbar() {
	ctx.fillStyle = 'white';

	drawText({
		text: Player.list[selfId].name,
		x: width / 2,
		y: height - 57.5,
		opacity: 0.58,
		font: 'bold 30px Ubuntu'
	});
	drawBar({
		x: canvas.width / 2 + (275 / 2),
		y: height - 37.5,
		label: `Score: ${Player.list[selfId].score}`,
		filled: 1,
		width: 275,
		height: 15,
		renderOnFull: true,
		opacity: 0.5
	});
	drawBar({
		x: canvas.width / 2 + (350 / 2),
		y: height - 15.5,
		label: `Lvl ${Player.list[selfId].level} ${tanktree[Player.list[selfId].tank].localized}`,
		filled: 1,
		width: 350,
		height: 20,
		fillColor: '#f0d96c',
		renderOnFull: true,
		opacity: 0.5
	});
}
// obj.width: total width of bar (in pixels)
// obj.height: total height of bar (in pixels)
// obj.color: background color
// obj.fillColor: color of filled area
// obj.filled: decimal representing how much of bar is filled
// obj.renderOnFull: still render even if a full bar
// obj.label: label inside of bar
// obj.x: X position of bar (centered)
// obj.y: Y position of bar (centered)
function drawBar(obj) {
	// CREATE OBJECT IF NOT SPECIFIED
	obj = obj == undefined ? {} : obj;
	// DEFAULTS
	obj.width = obj.width == undefined ? 30 : obj.width;
	obj.height = obj.height == undefined ? 6 : obj.height;
	obj.color = obj.color == undefined ? '#555555' : obj.color;
	obj.fillColor = obj.fillColor == undefined ? '#88e281' : obj.fillColor;
	obj.filled = obj.filled == undefined ? 0.5 : obj.filled;
	obj.renderOnFull = obj.renderOnFull == undefined ? true : obj.renderOnFull;
	obj.label = obj.label == undefined ? '' : obj.label;
	obj.x = obj.x == undefined ? 30 : obj.x - (obj.width / 2);
	obj.y = obj.y == undefined ? 30 : obj.y - (obj.height / 2);
	if (obj.filled < 1 || obj.renderOnFull) {
		ctx.lineJoin = 'round';
		ctx.fillStyle = obj.color;
		ctx.fillRect(obj.x - (obj.width / 2), obj.y - (obj.height / 2), obj.width,
			obj.height);
		ctx.fillStyle = obj.fillColor;
		ctx.fillRect(obj.x - (obj.width / 2) + 1, (obj.y - (obj.height / 2)) + 1,
			obj.filled * (obj.width - 2), obj.height - 2);

		drawText({
			text: obj.label,
			x: obj.x,
			y: obj.y + 3,
			font: `${obj.height - 5}px Ubuntu`
		})
	}
}
let drawScoreboard = function() {
	drawText({
		text: 'Scoreboard',
		x: width - 200,
		y: 40,
		opacity: '0.8',
		font: 'bold 30px Ubuntu'
	});
	scoreboardData.forEach((key, index) => {
		drawBar({
			x: width - 100,
			y: 70 + (index * 20),
			label: key[0],
			filled: key[1],
			width: 200,
			height: 15,
			renderOnFull: true
		});
	});
}
