const parser = require("socket.io-parser");
const decoder = new parser.Decoder();
const encoder = new parser.Encoder();

module.exports = class extends WebSocket {
	constructor() {
		super(...arguments);

		this.addEventListener("message", event => {
			decoder.add(event.data);
			decoder.on("decoded", decoded => {
				this.dispatchEvent(new CustomEvent("msg", {
					detail: decoded.data,
				}));
			});
		});
	}

	emit(msg) {
		encoder.encode({
			type: parser.EVENT,
			data: msg,
			id: 0,
		}, encoded => {
			this.send(encoded[0].toString());
		});
	}
};