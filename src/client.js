const funcs = require("./functions.js");

const $ = require("jquery-browserify");

const Socket = require("./socket.js");
const ws = new Socket("ws://localhost:8080/");

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

const inGame = false;
let isConnected = false;

let tanks = {};

ws.addEventListener("open", () => {
	isConnected = true;
});
ws.addEventListener("message", data => {
	if (data.detail === null) return;

	const msg = data.detail;
	switch (msg[0]) {
		case "tanks_update":
			tanks = msg[1];
			break;
		case "signInResponse":
			inGame = msg[1].success;
			break;
		default:
			console.log(msg);
	}
});

const input = $("#textInput");
input.on("keydown", event => {
	if (event.originalEvent.code === "Enter") {
		input.val(input.val().slice(0, 16));
		ws.emit([
			"signIn",
			{
				name: input.val(),
				tank: "basic",
				width: 0,
				height: 0,
			},
		]);
	}
});

const ctx = canvas.get(0).getContext("2d");
function render() {
	ctx.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));

	if (inGame) {
		input.css("display", "none");
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