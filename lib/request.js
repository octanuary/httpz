import { IncomingMessage } from "http";
import bodyParser from "./util/bodyParser.js";

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
	}
}