const funcs = require("./functions.js");

const $ = require("jquery-browserify");

const ws = new WebSocket("ws://localhost:8080/");

const canvas = $("#main");
canvas.contextmenu(event => event.preventDefault());

function resize() {
	canvas.attr("width", window.innerWidth);
	canvas.attr("height", window.innerHeight);
}

window.addEventListener("resize", resize);
resize();

const loading = $("#loading");
window.addEventListener("load", () => {
	loading.css("display", "none");
});

let inGame = false;
let isConnected = false;

let tanks = {};

let entities = [];
let selfID = null;

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
			console.log(entities);
			break;
		case "SPAWN_RESPONSE":
			console.log(msg);
			selfID = msg[1];
			inGame = true;

			break;
		default:
			console.log(msg);
	}
});

const input = $("#textInput");
input.on("keydown", event => {
	if (event.originalEvent.code === "Enter") {
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

const ctx = canvas.get(0).getContext("2d");
function render() {
	ctx.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

	if (inGame && selfID !== null) {
		input.css("display", "none");

		funcs.grid(ctx, 0, 0, canvas.attr("width"), canvas.attr("height"));

		ctx.fillStyle = "black";
		entities.forEach(entity => {
			if (entity === null) return;

			const x = entity.position.x - entities[selfID].position.x + canvas.attr("width") / 2;
			const y = entity.position.y - entities[selfID].position.y + canvas.attr("height") / 2;

			ctx.fillRect(x - 12.5, y - 12.5, 25, 25);
			funcs.drawText(ctx, x, y - 30, entity.name || "an unnamed tank", 20);

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