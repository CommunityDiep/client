"use strict";

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	alert(
		'It looks likes you\'re on mobile. For the best experience, play on your PC.'
	)
}
// for soft stroking
// Source: https://stackoverflow.com/a/13542669/5513988
function shadeColor(color, percent) {
	var f = parseInt(color.slice(1), 16),
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

let hitRegions = [];
let upgradeHitRegions = [];

hitRegions.push({
	x: canvas.width / 2 - 50,
	y: canvas.width / 2 - 15,
	width: 100,
	height: 30,
	activate: function() {
		if (!inGame) {
			console.log('server selector button clicked')
		}
	}
});

var bgImage = new Image();
bgImage.src = 'https://diep.io/title.png';

var date = new Date();

var hatImage = new Image();
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

function param(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
		'([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(
		/\+/g, '%20')) || null;
}
var par = param('s') == undefined ? 'ffa' : param('s');
document.getElementById('server').value = par;
var servers = {
	ffa: {
		name: 'Free For All',
		servers: ['localhost:8080'] // ['https://cdiep-serv-nylr.c9users.io/','https://cdiep-serv-nylr.c9users.io/']
	},
	tdm: {
		name: '2 Teams Deathmatch'
	},
	ftdm: {
		name: '4 Teams Deathmatch',
		servers: []
	},
	tag: {
		name: 'Tag',
		servers: []
	},
	farm: {
		name: 'Farming',
		servers: []
	}
};
var resulter;
var servernum = randInt(1, servers[par].servers.length);
var servername = par + 1; // randInt(0,servers[param('s')].servers.length-1)]
var socket = io.connect(param('ip') == undefined ? servers[par].servers[
	servernum - 1] : param('ip'), {
	reconnect: false
});
var tanktree = {};
socket.on('tanks_update', function (data) {
	tanktree = data;
})
socket.on('disconnect', function (err) {
	console.log(err)
	var socket = function () {
		return io.connect(servers[par].servers[servernum - 1], {
			reconnect: false
		})
	};
});
document.getElementById('server').addEventListener('change', function () {
	if (!(document.getElementById('server').value == 'select')) {
		window.open(
			`${location.origin}${location.pathname}?s=${document.getElementById('server').value}`,
			'_self');
	}
});

function calculateBarrelPos(angle) {
	var xPos = Math.cos(angle / 180 * Math.PI) * 15;
	var yPos = Math.sin(angle / 180 * Math.PI) * 15;
	return {
		x: xPos,
		y: yPos,
	};
}

function drawTank2(obj) {
	drawTank(obj.x, obj.y, obj.angle, obj.radius, obj.bodyColor, obj.barrels, obj.bodyType, obj.showHatSecret);
}

function drawTank(x, y, angle, radius, color, barrels, bodyType, hat) {
	hat = hat == undefined ? true : hat;

	var animationTime = new Date().getTime()
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(degToRad(angle));
	ctx.scale(radius / 48, radius / 48);
	ctx.lineJoin = 'round';
	ctx.strokeStyle = softStroke ? shadeColor('#999999', -0.25) : '#555555';
	ctx.fillStyle = '#999999';
	ctx.lineWidth = 4 / (radius / 48);
	for (var i = 0; i < barrels.length; i++) {
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
var width = window.innerWidth;
var height = window.innerHeight;
// sigin
// var chooseTank = document.getElementById('choose-tank');
var gameDiv = document.getElementById('gameDiv');
var input = document.getElementById('textInput');
document.getElementById('textInput').addEventListener('change', function () {
});

var spin_angle = 0;

function tryJoin() {
	if (input.value != '') {
		var ip = 104024 * Math.random();
		socket.emit('signIn', {
			name: input.value,
			address: ip,
			tank: 'basic',
			width: width,
			height: height
		});
		localStorage.username = document.getElementById('textInput').value || '';
	} else {
		alert('Please enter a name.');
	}
}

window.addEventListener('load', function () {
	document.getElementById('textInput').value = localStorage.username || '';
});

socket.on('signInResponse', function (data) {
	if (data.success) {
		gameDiv.style.display = 'inline-block';

		inGame = true;
	} else alert('Unable to join. Please try again later.');
});

socket.on('killNotification', function (data) {
	if (selfId) {
		Player.list[data.killer].notif_timer = 0;
		Player.list[data.killer].killtext = 'You\'ve killed ' + data.killed +
			'.';
	}
});

// game
var sorted = [];
var changed_indexes = [];
var original_indexes = [];
var points = [];
var nicknames = [];
var selfId = null;
var sortedScores = {};
var ctx = document.getElementById('ctx').getContext('2d');
var canvas = document.getElementById('ctx');
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
	ctx.globalOpacity = obj.opacity == undefined ? 1 : obj.opacity;
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
	var step = ((Math.PI * 2) / sides);
	ctx.translate(x, y);
	ctx.rotate(degToRad(angle));
	ctx.moveTo(radius * 2, 0);
	for (var i = 1; i < sides + 2; i++) {
		ctx.lineTo(2 * radius * Math.cos(step * i), 2 * radius * Math.sin(step * i));
	}
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};
var Shape = function (initPack) {
	var self = {}
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
		var x = self.x - Player.list[selfId].x + width / 2;
		var y = self.y - Player.list[selfId].y + height / 2;
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
							drawTank2({
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
var Player = function (initPack) {
	var self = {};
	self.canUpgrade = false;
	self.hasUpgraded = false;
	self.notif_timer = 0;
	self.killtext = '';
	self.id = initPack.id;
	self.number = initPack.number;
	self.x = initPack.x;
	self.y = initPack.y;
	self.tank = initPack.tank;
	self.hp = initPack.hp,
		self.hpMax = initPack.hpMax,
		self.score = initPack.score,
		self.level = initPack.level,
		self.tier = initPack.tier,
		self.name = initPack.name,
		self.mouseAngle = initPack.mouseAngle;
	self.invisible = initPack.invisible;
	self.team = initPack.team;
	self.autospin = initPack.autospin;
	self.angle = self.mouseAngle;
	self.draw = function (angle, isPlayer) {
		if (isPlayer) {
			self.angle = angle;
		} else {
			self.angle = self.mouseAngle;
		}
		var x = self.x - Player.list[selfId].x + width / 2;
		var y = self.y - Player.list[selfId].y + height / 2;
		var tcolor = {
			'red': '#F14E54',
			'blue': '#1DB2DF',
			'purple': '#BE83F2',
			'green': '#24DF73'
		};
		ctx.fillStyle = 'black';
		var hpWidth = 30 * self.hp / self.hpMax;
		ctx.font = '30px Ubuntu';
		if (!self.invisible) {
			var size = 25; // + parseInt(self.score)*1.25;
			var score = self.score + 3
			if (size > 32) {
				var size = 32;
			}
			if (size < 25) {
				var size = 25;
			}
			if (score > 3) {
				var score = 3;
			}
			var angle;
			var tcolor = {
				'red': '#F14E54',
				'blue': '#1DB2DF',
				'purple': '#BE83F2',
				'green': '#24DF73'
			};
			if (self.team === 'none') {
				var color = self.id === selfId ? '#1DB2DF' : '#F14E54';
			} else {
				var color = tcolor[self.team];
			};
			drawTank(x, y, self.angle, 24 + (self.level / 3), color, tanktree[self.tank].barrels,
				tanktree[self.tank].body);
			drawBar({
				x: x + size,
				y: (y + size) + 15,
				filled: self.hp / self.hpMax,
				width: 38,
				height: 7,
				renderOnFull: false
			});
			// DRAW NAMES
			if (self.id !== selfId) {
				drawText({
					text: self.name,
					x: x + (size / 2),
					y: y - size + 16,
					font: '17px Ubuntu'
				});
			}
		}
	};
	Player.list[self.id] = self;
	return self;
}
var angle = 0;
var angle_pure = 0;
var mouseX;
var mouseY;
$(document).mousemove(function (e) {
	if (!selfId || Player.list[selfId].autospin) return;
	var x = -width + e.pageX - 8;
	var y = -height + e.pageY - 8;
	angle = Math.atan2(y, x) / (Math.PI * 180);
	var boxCenter = [(width / 2) + 25 / 2, (height / 2) + 25 / 2];
	angle = Math.atan2(e.pageX - boxCenter[0], -(e.pageY - boxCenter[1])) * (
		180 / Math.PI);
	angle_pure = Math.atan2(e.pageX - boxCenter[0], -(e.pageY - boxCenter[1]) *
		(180 / Math.PI));
	angle = angle - 90;
	if (Player.list[selfId].autospin) {
		var mgpower = setInterval(function () {
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

function drawGrid(x, y, width, height, slotSize, lineColor, xOffset, yOffset) {
	ctx.fillStyle = '#cdcdcd';
	ctx.fillRect(x, y, width, height);
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.strokeColor = lineColor;
	ctx.lineWidth = 1;
	for (var i = 0; i < width || i < height; i += slotSize) {
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
	ctx.globalAlpha = 0.9;
	ctx.font = 'bold 20px Ubuntu';
	ctx.lineWidth = 5;
	ctx.textAlign = 'center';
	ctx.strokeStyle = '#555555';
	ctx.lineJoin = 'round';
	ctx.fillStyle = obj.color;
	ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
	ctx.fillStyle = '#000000';
	ctx.globalAlpha = 0.2;
	ctx.fillRect(obj.x, obj.y + (obj.height / 2), obj.width, obj.height / 2);
	ctx.globalAlpha = 1;
	ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
	if (typeof obj.tankData !== 'string') {
		ctx.globalAlpha = 1;
		drawTank(obj.x + (obj.width / 2), obj.y + (obj.height / 2), spin_angle, obj.width / 5, '#1DB2DF',
			obj.tankData.barrels, obj.tankData.body);
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
		var uptank = tanktree[Object.keys(tanktree[selfPlayer.tank].upgrades)[
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

						for (let item of upgradeHitRegions) {
							hitRegions.splice(item, 1);
						}

						upgradeHitRegions = [];
					}
				});

				upgradeHitRegions.push(hitRegions.length - 1);
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
		var radius = 0;
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
var Bullet = function (initPack) {
	var self = {};
	self.id = initPack.id;
	self.pid = initPack.parent_id;
	self.x = initPack.x;
	self.y = initPack.y;
	if (Player.list[self.pid]) {
		self.parent_tank = Player.list[self.pid].tank;
	}
	self.type = initPack.type;
	var color = self.parent_tank == 'Arena Closer' ? '#FEE769' : self.pid ===
		selfId ? '#1DB2DF' : '#F14E54';
	self.draw = function () {
		var x = self.x - Player.list[selfId].x + width / 2;
		var y = self.y - Player.list[selfId].y + height / 2;
		if (self.parent_tank == 'destroyer' || self.parent_tank ==
			'destroyerflank' || self.parent_tank == 'Hybrid') {
			ctx.fillStyle = color;
			drawCircle(x, y, 20, color, self.type)
		} else if (self.parent_tank == 'Arena Closer') {
			ctx.fillStyle = color;
			drawCircle(x, y, 19, color, self.type)
		} else if (self.parent_tank == 'streamliner') {
			ctx.fillStyle = color;
			drawCircle(x, y, 8, color, self.type)
			// ctx.drawImage(Img.bullet,self.x-5,self.y-5,15,15);
		} else {
			ctx.fillStyle = color;
			drawCircle(x, y, 10, {
				'red': 'F14E54',
				'blue': '#1DB2DF'
			}.team, self.type)
			// ctx.drawImage(Img.bullet,self.x-5,self.y-5,20,20);
		}
	}
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};
socket.on('init', function (data) {
	if (data.selfId) {
		selfId = data.selfId;
	}
	// console.log(data.player.length);
	for (var i = 0; i < data.player.length; i++) {
		new Player(data.player[i]);
	}
	for (var i = 0; i < data.bullet.length; i++) {
		new Bullet(data.bullet[i]);
	}
	for (var i = 0; i < data.shape.length; i++) {
		new Shape(data.shape[i]);
	}
});
socket.on('update', function (data) {
	points = [];
	nicknames = [];
	for (var i = 0; i < data.player.length; i++) {
		var player_id = data.player[i].id;
		var pack = data.player[i];
		var p = Player.list[pack.id]
		player_id = Number(String(player_id).replace('0.', ''));
		points.push(data.player[i].score + '.' + player_id);
		if (p) {
			if (pack.tank) {
				p.tank = pack.tank;
			}
			if (pack.mouseAngle !== undefined) {
				p.mouseAngle = pack.mouseAngle;
			}
			if (pack.upgraded != undefined) p.hasUpgraded = pack.upgraded;
			if (pack.x !== undefined) p.x = pack.x;
			if (pack.y !== undefined) p.y = pack.y;
			if (pack.hp !== undefined) p.hp = pack.hp;
			if (pack.score !== undefined) p.score = pack.score;
			p.level = pack.level;
			p.tier = pack.tier;
		}
	}
	for (var i = 0; i < data.player.length; i++) {
		if (data.player[i].id == selfId) {
			var pack = data.shape[data.player[i].id];
			for (var i = 0; i < pack.length; i++) {
				var s = Shape.list[pack[i].id];
				if (s) {
					if (pack[i].x !== undefined) s.x = pack[i].x;
					if (pack[i].y !== undefined) s.y = pack[i].y;
				}
			}
		}
	}
	for (var i = 0; i < data.bullet.length; i++) {
		var pack = data.bullet[i];
		var b = Bullet.list[data.bullet[i].id];
		if (b) {
			if (pack.x !== undefined) b.x = pack.x;
			if (pack.y !== undefined) b.y = pack.y;
		}
	}
});

socket.on('scoreboard', (data) => {
	scoreboardData = data;
})

// remove
socket.on('remove', function (data) {
	for (var i = 0; i < data.player.length; i++) {
		delete Player.list[data.player[i]];
	}
	for (var i = 0; i < data.bullet.length; i++) {
		delete Bullet.list[data.bullet[i]];
	}
	for (var i = 0; i < data.shape.length; i++) {
		delete Shape.list[data.shape[i]];
	}
});
// drawing
var pastx;
var pasty;
setInterval(function () {
	canvas.width = window.innerWidth;
	width = window.innerWidth;
	canvas.height = window.innerHeight;
	height = window.innerHeight;
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
		ctx.fillStyle = '#cdcdcd';
		drawGrid(width / 2 - Player.list[selfId].x, height / 2 - Player.list[
			selfId].y, 1500, 1500, 24, '#C6C6C6', 0, 0);
		pastx = Player.list[selfId].x;
		pasty = Player.list[selfId].y;
		for (var i in Shape.list) {
			Shape.list[i].draw();
		}
		for (var i in Bullet.list) {
			Bullet.list[i].draw();
		}
		for (var i in Player.list) {
			if (Player.list[i].id == selfId) {
				Player.list[i].draw(angle, true);
			} else {
				Player.list[i].draw(angle, false);
			}
			Player.list[i].notif_timer += 1;
		}
		drawUpgrades();
		drawHotbar();
		drawKills();
		drawPlayerCount();
		drawScoreboard();
	} else {
		// SHOW TEXT INPUT
		textInput.style.display = 'initial';
		// TITLE SCREEN IMAGE
		var canvasRatio = canvas.width / canvas.height;
		var bgImageRatio = bgImage.width / bgImage.height;
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
		document.getElementById('textInput').style.left = (canvas.width / 2) -
			160 + 'px';
		document.getElementById('textInput').style.top = (canvas.height / 2) -
			20 + 'px';
		drawText({
			text: '(press enter to spawn)',
			x: canvas.width / 2,
			y: (canvas.height / 2) + 32,
			font: 'bold 10px Ubuntu'
		});
	}
}, 10);
// Replace this with drawStats soon.
// The new function will include player count/server name,
// but will look more like Diep.io's bottom-right corner text.
function drawPlayerCount() {
	var players = Object.keys(Player.list).length
	var plural = Object.keys(Player.list).length == 1 ? '' : 's';
	drawText({
		text: `${Object.keys(Player.list).length} player${plural} on ${servername}`,
		x: width - 190,
		y: height - 50,
		font: 'bold 30px Ubuntu'
	});
};

function drawKills() {
	if (Player.list[selfId].notif_timer < 400) {
		ctx.fillStyle = 'white';
		drawText({
			text: Player.list[selfId].killtext,
			x: (width / 2) - 120,
			y: 30,
			font: 'bold 30px Ubuntu'
		});
	}
};

function drawHotbar() {
	ctx.fillStyle = 'white';

	drawText({
		text: Player.list[selfId].name,
		x: width / 2,
		y: height - 57.5,
		opacity: '0.8',
		font: 'bold 30px Ubuntu'
	});
	drawBar({
		x: canvas.width / 2 + (275 / 2),
		y: height - 37.5,
		label: `Score: ${Player.list[selfId].score}`,
		filled: 1,
		width: 275,
		height: 15,
		renderOnFull: true
	});
	drawBar({
		x: canvas.width / 2 + (350 / 2),
		y: height - 15.5,
		label: `Lvl ${Player.list[selfId].level} ${tanktree[Player.list[selfId].tank].localized}`,
		filled: 1,
		width: 350,
		height: 20,
		fillColor: '#f0d96c',
		renderOnFull: true
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
var drawScoreboard = function () {
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

document.addEventListener('keydown', function (event) {
	if (event.keyCode == 69) // e
		socket.emit('keyPress', {
			inputId: 'auto',
			state: true
		});
	if (event.keyCode == 67) // c
		socket.emit('keyPress', {
			inputId: 'spin',
			state: true
		});
	if (event.keyCode == 68 || event.keyCode == 39) { // d or right
		socket.emit('keyPress', {
			inputId: 'right',
			state: true
		});
		// Player.list[i].x +=1;
	} else if (event.keyCode == 83 || event.keyCode == 40) // s or down
		socket.emit('keyPress', {
			inputId: 'down',
			state: true
		});
	else if (event.keyCode == 65 || event.keyCode == 37) { // a or left
		socket.emit('keyPress', {
			inputId: 'left',
			state: true
		});
		// Player.list[i].x -= 1;
	} else if (event.keyCode == 87 || event.keyCode == 38) // w or up
		socket.emit('keyPress', {
			inputId: 'up',
			state: true
		});
	else if (event.keyCode == 32) // spacebar
		socket.emit('keyPress', {
			inputId: 'attack',
			state: true
		});
	else if (event.keyCode == 16) // shift
		socket.emit('keyPress', {
			inputId: 'repel',
			state: true
		});
	else if (event.keyCode == 123) // f11
		if (!document.fullscreenElement) {
			document.getElementById('ctx').webkitRequestFullscreen();
		} else {
			document.exitFullscreen();
		}

	if (document.activeElement == document.getElementById("textInput") && event.keyCode == 13) {
		tryJoin();
	}
});

document.addEventListener('keyup', function (event) {
	switch (event.keyCode) {
		case 68:
		case 39:
			socket.emit('keyPress', {
				inputId: 'right',
				state: false
			});
			break;
		case 83:
		case 40:
			socket.emit('keyPress', {
				inputId: 'down',
				state: false
			});
			break;
		case 65:
		case 37:
			socket.emit('keyPress', {
				inputId: 'left',
				state: false
			});
			break;
		case 87:
		case 38:
			socket.emit('keyPress', {
				inputId: 'up',
				state: false
			});
			break;
		case 32:
			socket.emit('keyPress', {
				inputId: 'attack',
				state: false
			});
			break;
		case 16:
			socket.emit('keyPress', {
				inputId: 'repel',
				state: false
			});
			break;
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
