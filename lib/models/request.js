import { IncomingMessage } from "http";
import bodyParser from "../util/bodyParser.js";

export default class Request extends IncomingMessage {
	constructor(socket) {
		super(socket);

		/**
		 * post body
		 */
		if (this.method == "POST") {
			bodyParser(this)
				.then(v => this.body = v)
				.catch(e => {
					throw e
				});
		}
	
		return this;
	}

	/**
	 * Initializes the new methods and properties.
	 */
	initialize() {
		this.parsedUrl = new URL(this.url, `http://${this.headers.host}`);

		this.query = Object.fromEntries(this.parsedUrl.searchParams);

		this.cookies = {};
		// parse the cookie header
		if (this.headers.cookie) {
			/** @type {string[]} */
			const cookies = this.headers.cookie.split(";");
			cookies.forEach(v => {
				let [name, val] = v.split("=");
				// remove leading whitespace
				if (name.startsWith(" ")) name = name.substring(1);
				this.cookies[name] = val;
			});
		}
	}
}
