import { IncomingMessage } from "http";
import { Socket } from "net";

/**
 * an extended version of IncomingMessage
 */
export default class Request<HasMatches = unknown> extends IncomingMessage {
	constructor(socket:Socket);

	cookies: {
		[k: string]: string
	};

	parsedUrl: URL;

	query: {
		[k: string]: string
	};

	matches: HasMatches;

	initialize(): this;
}
