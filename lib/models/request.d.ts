/*!
 * httpz.Request
 * Author: octanuary
 * License: MIT
 */
import { IncomingMessage } from "http";

/**
 * An extended version of IncomingMessage.
 */
declare class Request extends IncomingMessage {
	constructor(socket: Socket): Request;

	cookies: {
		[k: string]: string
	};

	parsedUrl: URL;

	query: {
		[k: string]: string
	} | undefined;
};
export = Request;
