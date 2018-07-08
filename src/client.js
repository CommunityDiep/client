const funcs = require("./functions.js");

const $ = require("jquery-browserify");

/**
 * The websocket connection to the server.
 */
const ws = new WebSocket("ws://localhost:8080/");

const canvas = $("#main");
canvas.contextmenu(event => event.preventDefault());

/**
 * Adjusts the canvas size to fit the window.
 */
function resize() {
	canvas.attr("width", window.innerWidth);
	canvas.attr("height", window.innerHeight);

	return [window.innerWidth, window.innerHeight];
}

window.addEventListener("resize", resize);
resize();

/**
 * The loading screen element.
 */
const loading = $("#loading");
window.addEventListener("load", () => {
	loading.css("display", "none");
});

/**
 * Whether this player has spawned yet.
 */
let inGame = false;

/**
 * Whether this player has successfully connected to the server.
 */
let isConnected = false;

let entities = [];

/**
 * This player's ID.
 */
let selfID = null;

/**
 * Gets the entity for this connection.
 */
function getSelf() {
	return entities.filter(entity => entity.id === selfID)[0];
}

ws.addEventListener("open", () => {
	isConnected = true;
});
ws.addEventListener("close", () => {
	isConnected = false;
	location.reload();
});
ws.addEventListener("message", event => {
	const msg = JSON.parse(event.data);
	switch (msg[0]) {
		case "TANK_UPDATE":
			tanks = msg[1];
			break;
		case "UPDATE":
			entities = msg[1];
			break;
		case "SPAWN_RESPONSE":
			selfID = msg[1];
			inGame = true;

			break;
	}
});

const input = $("#textInput");
input.on("keydown", event => {
	if (event.keyCode === 13) {
		input.val(input.val().slice(0, 16));
		ws.send(JSON.stringify([
			"SPAWN",
			{
				name: input.val(),
				tank: "basic",
				width: 0,
				height: 0,
			},
		]));
	}
});

/**
 * Whether this player is auto-firing or not.
 */
let isFiring = false;
window.addEventListener("keydown", () => {
	switch (event.keyCode) {
		case 13:
		case 32:
			ws.send("[\"IS_FIRING\", true]");
			break;
		case 69:
			isFiring = !isFiring;
			ws.send(JSON.stringify(["IS_FIRING", isFiring]));

			break;
	}
});
window.addEventListener("keyup", () => {
	switch (event.keyCode) {
		case 13:
		case 32:
			ws.send("[\"IS_FIRING\", false]");
			break;
	}
});

/**
 * The canvas context.
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.get(0).getContext("2d");

/**
 * Renders the game.
 */
function render() {
	ctx.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

	if (inGame && selfID !== null) {
		input.css("display", "none");

		funcs.grid(ctx, 0, 0, canvas.attr("width"), canvas.attr("height"));

		ctx.fillStyle = "black";
		entities.forEach(entity => {
			if (entity === null) return;

			const x = entity.position.x - getSelf().position.x + canvas.attr("width") / 2;
			const y = entity.position.y - getSelf().position.y + canvas.attr("height") / 2;

			funcs.drawTank(ctx, x, y, entity.angle, 15, "black", [], 0);
			funcs.drawText(ctx, x, y - 30, entity.name || "", 20);

			ctx.restore();
		});
	} else {
		funcs.grid(ctx, 0, 0, canvas.attr("width"), canvas.attr("height"));

		funcs.drawText(ctx, canvas.attr("width") / 2, 60, "Community", 30);
		funcs.drawText(ctx, canvas.attr("width") / 2, 150, "Diep.io", 100);

		if (isConnected) {
			input.css("display", "initial");

			funcs.drawText(ctx, canvas.attr("width") / 2, canvas.attr("height") / 2 - 40, "This is the tale of...", 20);
			funcs.drawText(ctx, canvas.attr("width") / 2, canvas.attr("height") / 2 + 45, "(press enter to spawn)", 15);
		} else {
			input.css("display", "none");

			funcs.drawText(ctx, canvas.attr("width") / 2, canvas.attr("height") / 2, "Connecting...", 50);
		}
	}

	window.requestAnimationFrame(render);
}
render();