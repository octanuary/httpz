import { Server as httpServer } from "http";
import Group from "./group.js";

declare type httpzOptions = {
	strictUrl?: boolean
};

export class Server extends Group {
	constructor(options?: httpzOptions);

	/**
	 * Alias of http.Server.listen().
	 */
	listen(): typeof httpServer.prototype.listen;

	server: httpServer
}
