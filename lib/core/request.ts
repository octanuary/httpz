import { IncomingMessage } from "http";
import { Socket } from "net";

/**
 * an extended version of IncomingMessage
 */
class Request<HasMatches = unknown> extends IncomingMessage {
	constructor(socket:Socket) {
		super(socket);
		return this;
	}

	cookies: {
		[k: string]: string
	};

	parsedUrl: URL;

	query: {
		[k: string]: string
	};

	matches: HasMatches;

	initialize() {
		this.parsedUrl = new URL(this.url as string, `http://${this.headers.host}`);
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
}
export default Request;
