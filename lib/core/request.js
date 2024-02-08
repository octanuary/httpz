const { IncomingMessage } = require("http");

/**
 * an extended version of IncomingMessage
 */
module.exports = class Request extends IncomingMessage {
	constructor(socket) {
		super(socket);
		return this;
	}

	initialize() {
		this.parsedUrl = new URL(this.url, `http://${this.headers.host}`);
		this.query = Object.fromEntries(this.parsedUrl.searchParams);
		this.cookies = {};
		// parse the cookie header
		if (this.headers.cookie) {
			(this.headers.cookie.split(";")).forEach((v) => {
				let [name, val] = v.split("=");
				// remove leading whitespace
				if (name.startsWith(" ")) {
					name = name.substring(1);
				}
				this.cookies[name] = val;
			});
		}
		return this;
	}
};
