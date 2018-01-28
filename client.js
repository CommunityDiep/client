"use strict";

if (typeof window.orientation !== 'undefined') {
	alert(
		"It looks like you're on mobile. For the best experience, use a computer to play this game."
	);
}
// for soft stroking
// Source: https://stackoverflow.com/a/13542669/5513988
function shadeColor(color, percent) {
	let f = parseInt(color.slice(1), 16),
		t = percent < 0 ? 0 : 255,
		p = percent < 0 ? percent * -1 : percent,
		R = f >> 16,
		G = f >> 8 & 0x00FF,
		B = f & 0x0000FF;
	return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round(
		(t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(
		1);
}
let softStroke = true;

let inGame = false;
let showServerSelector = false;
let showAdvancedConnectionOptions = false;

let scoreboardData = [];

const uiColors = [
	"#6cf1ec",
	"#98f06b",
	"#f06c6c",
	"#f0d96c",
	"#6c96f0",
	"#b894fa",
	"#ec6bf1",
	"#eeb790"
];

const teamColors = {
	// FFA psuedoteams
	'enemy': '#F14E54',
	'self': '#1DB2DF',

	// TDM teams
	'red': '#F14E54',
	'blue': '#1DB2DF',

	// Extended set for 4-teamed TDM
	'purple': '#BE83F2',
	'green': '#24DF73'
};

let hitRegions = [];

let bgImage = new Image();
bgImage.src = 'https://diep.io/title.png';

let date = new Date();

let hatImage = new Image();
hatImage.src = 'http://www.officialpsds.com/images/thumbs/Santa-Hat-psd89867.png';

// Prevent scrolling
window.addEventListener('scroll', function (event) {
	event.preventDefault();
	window.scrollTo(0, 0);
});

// Disable Chrome two-finger swipe to go back/forward
// Source: https://stackoverflow.com/a/46439501/5513988
document.addEventListener('touchstart', this.handleTouchStart, {
	passive: false
})
document.addEventListener('touchmove', this.handleTouchMove, {
	passive: false
})

function randInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function defaults(thing, efault) {
	return thing === undefined || thing === null ? efault : thing;
}

function param(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
		'([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(
		/\+/g, '%20')) || null;
}

let connectIP = defaults(param("ip"), "http://localhost:8080");

let socket = io.connect(connectIP, {
	reconnect: false
});

let tanktree = {};
socket.on('tanks_update', function (data) {
	tanktree = data;
})

socket.on('disconnect', function (err) {
	console.log(err)
	socket = function () {
		return io.connect(connectIP, {
			reconnect: false
		});
	};
});

function calculateBarrelPos(angle) {
	let xPos = Math.cos(angle / 180 * Math.PI) * 15;
	let yPos = Math.sin(angle / 180 * Math.PI) * 15;
	return {
		x: xPos,
		y: yPos,
	};
}

function drawTank(obj) {
	let x = obj.x;
	let y = obj.y;
	let angle = obj.angle;
	let radius = obj.radius;
	let color = obj.bodyColor;
	let barrels = obj.barrels;
	let bodyType = obj.bodyType;
	let hat = obj.showHatSecret;

	hat = hat == undefined ? true : hat;

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
	if (bodyType == 0) {
		ctx.beginPath();
		ctx.arc(48 - 48, 48 - 48, 48, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = '#000000';
	} else if (bodyType == 1) {
		ctx.fillStyle = color;
		ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
		ctx.fillRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
		ctx.strokeRect(-1 * radius * 2, -1 * radius * 2, radius * 4, radius * 4);
	} else if (bodyType == 2) {
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
	} else if (bodyType == 3) {
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
	};

	if (hat && date.getMonth() == 11 && date.getDate() == 25) {
		ctx.rotate(5.6);
		ctx.drawImage(hatImage, -5 - radius, -105 - radius, radius * 5, radius * 5);
		ctx.rotate(-5.6);
	}

	ctx.restore();
};
let width = window.innerWidth;
let height = window.innerHeight;
// sigin
// let chooseTank = document.getElementById('choose-tank');
let gameDiv = document.getElementById('gameDiv');
let input = document.getElementById('textInput');
input.addEventListener('change', function () {
});

let spin_angle = 0;

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

window.addEventListener('load', function () {
	input.value = localStorage.getItem("username") || "";

	canvas.style.display = "initial";
	document.getElementById("loading").style.display = "none";
});

socket.on('signInResponse', function (data) {
	if (data.success) {
		gameDiv.style.display = 'inline-block';

		inGame = true;
		showServerSelector = false;
		showAdvancedConnectionOptions = false;
	} else alert('Unable to join. Please try again later.');
});

// game
let sorted = [];
let changed_indexes = [];
let original_indexes = [];
let points = [];
let nicknames = [];
let selfId = null;
let sortedScores = {};

let canvas = document.getElementById('ctx');
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.lineJoin = 'round';
// init
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

function drawPolygon(x, y, angle, radius, color, sides) {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = softStroke ? shadeColor(color, -0.25) : '#555555';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	let step = ((Math.PI * 2) / sides);
	ctx.translate(x, y);
	ctx.rotate(degToRad(angle));
	ctx.moveTo(radius * 2, 0);
	for (let i = 1; i < sides + 2; i++) {
		ctx.lineTo(2 * radius * Math.cos(step * i), 2 * radius * Math.sin(step * i));
	}
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};
let Shape = function (initPack) {
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
	self.draw = function () {
		if (Math.abs(Player.list[selfId].x - self.x) > width / 2 + 50 || Math.abs(
				Player.list[selfId].y - self.y) > height / 2 + 50) {
			return;
		}
		let x = self.x - Player.list[selfId].x + width / 2;
		let y = self.y - Player.list[selfId].y + height / 2;
		if (self.name === 'secret-shape1') {
			drawPolygon(x, y, self.angle, 17, self.color, 10);
			drawPolygon(x, y, self.angle, 15, self.color, 9);
			drawPolygon(x, y, self.angle, 13, self.color, 8);
			drawPolygon(x, y, self.angle, 11, self.color, 7);
			drawPolygon(x, y, self.angle, 9, self.color, 6);
		} else {
			if (self.name === 'triangle') {
				drawPolygon(x, y, self.angle, 9, self.color, 3);
			} else {
				if (self.name === 'alphapentagon') {
					drawPolygon(x, y, self.angle, 50, self.color, 5);
				} else {
					if (self.name === 'pentagon') {
						drawPolygon(x, y, self.angle, 17, self.color, 5);
					} else {
						if (self.name === 'square') {
							drawTank({
								x: x,
								y: y,
								angle: self.angle,
								radius: 18.5,
								bodyColor: self.color,
								barrels: [],
								bodyType: 1,
								showHatSecret: false
							});
						}
					}
				}
			}
		}
	}
	Shape.list[self.id] = self;
	return self;
}
Shape.list = {};
class Player {
	constructor(initPack) {
		this.id = initPack.id;
		this.number = initPack.number;
		this.x = initPack.x;
		this.y = initPack.y;
		this.tank = defaults(initPack.tank, "basic");
		this.hp = initPack.hp,
		this.hpMax = initPack.hpMax,
		this.score = defaults(initPack.score, 0),
		this.level = defaults(initPack.level, 0),
		this.tier = defaults(initPack.tier, 0),
		this.name = defaults(initPack.name, ""),
		this.mouseAngle = initPack.mouseAngle;
		this.invisible = initPack.invisible;
		this.team = initPack.team;
		this.autospin = initPack.autospin;
		this.angle = defaults(this.mouseAngle, 0);

		this.draw = function (angle, isPlayer) {
			if (isPlayer) {
				this.angle = angle;
			} else {
				this.angle = this.mouseAngle;
			}
			let x = this.x - Player.list[selfId].x + width / 2;
			let y = this.y - Player.list[selfId].y + height / 2;
			ctx.fillStyle = 'black';
			let hpWidth = 30 * this.hp / this.hpMax;
			ctx.font = '30px Ubuntu';
			if (!this.invisible) {
				let size = 25; // + parseInt(this.score)*1.25;
				let score = this.score + 3
				if (size > 32) {
					let size = 32;
				}
				if (size < 25) {
					let size = 25;
				}
				if (score > 3) {
					let score = 3;
				}
				let color = teamColors["blue"];
				if (this.team === 'none') {
					let color = this.id === selfId ? '#1DB2DF' : '#F14E54';
				} else {
					let color = teamColors[this.team];
				};
				drawTank({
					x: x,
					y: y,
					angle: this.angle,
					radius: 24 + (this.level / 3),
					bodyColor: color,
					barrels: tanktree[this.tank].barrels,
					bodyType: tanktree[this.tank].body,
					showHatSecret: true
				});
				drawBar({
					x: x + size,
					y: (y + size) + 15,
					filled: this.hp / this.hpMax,
					width: 38,
					height: 7,
					renderOnFull: false
				});
				// DRAW NAMES
				if (this.id !== selfId) {
					drawText({
						text: this.name,
						x: x + (size / 2),
						y: y - size + 16,
						font: '17px Ubuntu'
					});
				}
			}
		};

		Player.list[this.id] = this;
	}
}

let angle = 0;
let angle_pure = 0;
let mouseX;
let mouseY;
$(document).mousemove(function (e) {
	if (!selfId || Player.list[selfId].autospin) return;
	let x = -width + e.pageX - 8;
	let y = -height + e.pageY - 8;
	angle = Math.atan2(y, x) / (Math.PI * 180);
	let boxCenter = [width / 2, height / 2];
	angle = Math.atan2(e.pageX - boxCenter[0], -(e.pageY - boxCenter[1])) * (
		180 / Math.PI);
	angle_pure = Math.atan2(e.pageX - boxCenter[0], -(e.pageY - boxCenter[1]) *
		(180 / Math.PI));
	angle = angle - 90;
	if (Player.list[selfId].autospin) {
		let mgpower = setInterval(function () {
			if (!Player.list[selfId].autospin) {
				clearInterval(mgpower);
			}
			angle++
		})
	}
	socket.emit('keyPress', {
		inputId: 'mouseAngle',
		state: angle
	});
});
Player.list = {};

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
	if (selfPlayer.tier && ![undefined, null, {}, []].includes(selfTankUpgrades)) {
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
class Bullet {
	constructor (initPack) {
		this.id = initPack.id;
		this.pid = initPack.parent_id;
		this.x = initPack.x;
		this.y = initPack.y;
		if (Player.list[this.pid]) {
			this.parent_tank = Player.list[this.pid].tank;
		}
		this.type = initPack.type;
		this.color = this.parent_tank == 'Arena Closer' ? '#FEE769' : this.pid ===
			selfId ? '#1DB2DF' : '#F14E54';

		Bullet.list[this.id] = this;
	}

	draw () {
		let x = this.x - Player.list[selfId].x + width / 2;
		let y = this.y - Player.list[selfId].y + height / 2;
		if (this.parent_tank == 'destroyer' || this.parent_tank ==
			'destroyerflank' || this.parent_tank == 'Hybrid') {
			ctx.fillStyle = this.color;
			drawCircle(x, y, 20, this.color, this.type)
		} else if (this.parent_tank == 'Arena Closer') {
			ctx.fillStyle = this.parent_tankcolor;
			drawCircle(x, y, 19, self.color, this.type)
		} else if (this.parent_tank == 'streamliner') {
			ctx.fillStyle = self.color;
			drawCircle(x, y, 8, self.color, this.type)
			// ctx.drawImage(Img.bullet,this.x-5,this.y-5,15,15);
		} else {
			ctx.fillStyle = self.color;
			drawCircle(x, y, 10, {
				'red': 'F14E54',
				'blue': '#1DB2DF'
			}.team, this.type)
			// ctx.drawImage(Img.bullet,this.x-5,this.y-5,20,20);
		}
	}
}

Bullet.list = {};
socket.on('init', function (data) {
	if (data.selfId) {
		selfId = data.selfId;
	}
	// console.log(data.player.length);
	for (let item of data.player) {
		new Player(item);
	}
	for (let item of data.bullet) {
		new Bullet(item);
	}
	for (let item of data.shape) {
		new Shape(item);
	}
});
socket.on('update', function (data) {
	points = [];
	nicknames = [];
	for (let i = 0; i < data.player.length; i++) {
		let player_id = data.player[i].id;
		let pack = data.player[i];
		let p = Player.list[pack.id]
		points.push(data.player[i].score + '.' + player_id);
		if (p) {
			if (pack.tank) {
				p.tank = pack.tank;
			}
			if (pack.mouseAngle !== undefined) {
				p.mouseAngle = pack.mouseAngle;
			}
			if (pack.x !== undefined) p.x = pack.x;
			if (pack.y !== undefined) p.y = pack.y;
			if (pack.hp !== undefined) p.hp = pack.hp;
			if (pack.score !== undefined) p.score = pack.score;
			p.level = pack.level;
			p.tier = pack.tier;
		}
	}
	for (let i = 0; i < data.player.length; i++) {
		if (data.player[i].id == selfId) {
			let pack = data.shape[data.player[i].id];
			for (let i = 0; i < pack.length; i++) {
				let s = Shape.list[pack[i].id];
				if (s) {
					if (pack[i].x !== undefined) s.x = pack[i].x;
					if (pack[i].y !== undefined) s.y = pack[i].y;
				}
			}
		}
	}
	for (let i = 0; i < data.bullet.length; i++) {
		let pack = data.bullet[i];
		let b = Bullet.list[data.bullet[i].id];
		if (b) {
			if (pack.x !== undefined) b.x = pack.x;
			if (pack.y !== undefined) b.y = pack.y;
		}
	}
});

socket.on('scoreboard', (data) => {
	scoreboardData = data;
})

let statusMessages = [];

socket.on("statusMessage", data => addStatusMessage);

function addStatusMessage(data) {
	let index = statusMessages.length;
	statusMessages[index] = data;

	setTimeout(function() {
		delete statusMessages[index];
	}, 2200);
}

// remove
socket.on('remove', function (data) {
	for (let i = 0; i < data.player.length; i++) {
		delete Player.list[data.player[i]];
	}
	for (let i = 0; i < data.bullet.length; i++) {
		delete Bullet.list[data.bullet[i]];
	}
	for (let i = 0; i < data.shape.length; i++) {
		delete Shape.list[data.shape[i]];
	}
});
// drawing
let pastx;
let pasty;
setInterval(function () {
	canvas.width = window.innerWidth;
	width = window.innerWidth;
	canvas.height = window.innerHeight;
	height = window.innerHeight;

	hitRegions = [];

	if (inGame) {
		if (Player.list[selfId]) {
			textInput.style.display = 'none';
		}
		if (spin_angle < 360) {
			spin_angle += 0.25;
		} else {
			spin_angle = 0;
		}
		if (!selfId) return;
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#b9b9b9';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawGrid(width / 2 - Player.list[selfId].x, height / 2 - Player.list[
			selfId].y, 1500, 1500, 24, '#cdcdcd', '#C6C6C6', 0, 0);
		pastx = Player.list[selfId].x;
		pasty = Player.list[selfId].y;
		for (let i in Shape.list) {
			Shape.list[i].draw();
		}
		for (let i in Bullet.list) {
			Bullet.list[i].draw();
		}
		for (let i in Player.list) {
			if (Player.list[i].id == selfId) {
				Player.list[i].draw(angle, true);
			} else {
				Player.list[i].draw(angle, false);
			}
		}

		// DRAW USER INTERFACE
		drawPlayerCount();
		drawScoreboard();
		// minimap would render here
		drawHotbar();
		drawStatusMessages();
		drawUpgrades();
	} else {
		// TITLE SCREEN IMAGE
		let canvasRatio = canvas.width / canvas.height;
		let bgImageRatio = bgImage.width / bgImage.height;
		if (canvasRatio > bgImageRatio) {
			ctx.drawImage(bgImage, 0, canvas.height / 2 - canvas.width /
				bgImageRatio / 2, canvas.width, canvas.width / bgImageRatio);
		} else {
			ctx.drawImage(bgImage, canvas.width / 2 - canvas.height *
				bgImageRatio / 2, 0, canvas.height * bgImageRatio, canvas.height);
		}
		// DARKEN THE IMAGE
		/* ctx.fillColor = 'black';
		ctx.globalAlpha = 0.03;

		ctx.fillRect(0, 0, canvas.width, canvas.height);*/
		drawText({
			text: 'This is the tale of...',
			x: canvas.width / 2,
			y: (canvas.height / 2) - 28,
			font: 'bold 18px Ubuntu'
		});
		ctx.fillStyle = 'white';
		ctx.fillRect((canvas.width / 2) - 160, (canvas.height / 2) - 20, 320,
			40);
		ctx.fillStyle = 'black';
		ctx.strokeRect((canvas.width / 2) - 160, (canvas.height / 2) - 20, 320,
			40);
		input.style.left = (canvas.width / 2) -
			160 + 'px';
		input.style.top = (canvas.height / 2) -
			20 + 'px';
		drawText({
			text: '(press enter to spawn)',
			x: canvas.width / 2,
			y: (canvas.height / 2) + 32,
			font: 'bold 10px Ubuntu'
		});

		drawClickArea({
			x: canvas.width / 2 - 55,
			y: 15,
			width: 120,
			height: 25,
			color: '#b0b0b0',
			strokeWidth: 4.5,
			tankData: 'Server Finder'
		});

		hitRegions.push({
			x: canvas.width / 2 - 55,
			y: 15,
			width: 120,
			height: 25,
			activate: function() {
				if (!inGame) {
					showServerSelector = !showServerSelector;
				}
			}
		});

		if (showServerSelector || showAdvancedConnectionOptions) {
			drawServerSelectorUI();
			textInput.style.display = 'none';
		} else {
			// SHOW TEXT INPUT
			textInput.style.display = 'initial';
		}

		drawStatusMessages();
	}
}, 10);

function drawServerSelectorUI () {
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
let drawScoreboard = function () {
	drawText({
		text: 'Scoreboard',
		x: width - 200,
		y: 40,
		opacity: '0.8',
		font: 'bold 30px Ubuntu'
	});

	for (let s in scoreboardData) {
		drawBar({
			x: width - 100,
			y: 70 + (s * 20),
			label: scoreboardData[s][0],
			filled: scoreboardData[s][1],
			width: 200,
			height: 15,
			renderOnFull: true
		});
	}
}

document.addEventListener('keydown', event => {
	inputHandler(event, true);
});

document.addEventListener('keyup', event => {
	inputHandler(event, false);
});

function inputHandler(event, isHeld) {
	if (document.activeElement == input && event.keyCode == 13) {
		tryJoin();
	}

	if (event.keyCode == 69 && isHeld) { // e
		socket.emit('keyPress', {
			inputId: 'auto',
			state: true
		});

		addStatusMessage({
			message: `Auto Fire toggled`,
			color: "indigo"
		});}
	if (event.keyCode == 67 && isHeld) { // c
		socket.emit('keyPress', {
			inputId: 'spin',
			state: true
		});

		addStatusMessage({
			message: `Auto Spin toggled`,
			color: "indigo"
		});
	}

	switch (event.keyCode) {
		case 68:
		case 39:
			socket.emit('keyPress', {
				inputId: 'right',
				state: isHeld
			});
			break;
		case 83:
		case 40:
			socket.emit('keyPress', {
				inputId: 'down',
				state: isHeld
			});
			break;
		case 65:
		case 37:
			socket.emit('keyPress', {
				inputId: 'left',
				state: isHeld
			});
			break;
		case 87:
		case 38:
			socket.emit('keyPress', {
				inputId: 'up',
				state: isHeld
			});
			break;
		case 32:
			socket.emit('keyPress', {
				inputId: 'attack',
				state: isHeld
			});
			break;
		case 16:
			socket.emit('keyPress', {
				inputId: 'repel',
				state: isHeld
			});
			break;
		case 123: // f11
			if (!document.fullscreenElement && isHeld) {
				canvas.webkitRequestFullscreen();
			} else {
				document.exitFullscreen();
			}
			break;
	}
}

input.addEventListener("click", function (event) {
	if (event.detail >= 3) {
		addStatusMessage({
			message: "Control change mode activated",
			color: "indigo"
		});
	}
});

document.addEventListener('mousedown', function (event) {
	if (inGame) {
		socket.emit('keyPress', {
			inputId: event.button == 0 ? 'attack' : 'repel',
			state: true
		});
	}

	for (let pos = 0; pos < hitRegions.length; pos++) {
		let pastMinX = event.clientX >= hitRegions[pos].x,
				pastMinY = event.clientY >= hitRegions[pos].y,
				beforeMaxX = event.clientX <= hitRegions[pos].x + hitRegions[pos].width,
				beforeMaxY = event.clientY <= hitRegions[pos].y + hitRegions[pos].height;

		if (pastMinX && pastMinY && beforeMaxX && beforeMaxY) {
			hitRegions[pos].activate(pos);
		}
	}
});

document.addEventListener('mouseup', function (event) {
	socket.emit('keyPress', {
		inputId: event.button == 0 ? 'attack' : 'repel',
		state: false
	});
});
