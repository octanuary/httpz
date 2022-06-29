/*!
 * httpz.Server
 * Author: octanuary
 * License: MIT
 */
import { Server as httpServer } from "http";
import Group from "./group.js";

declare type ServerCallback = (req: Request, res: Response, next: Promise<any>) => any;
declare type httpzOptions = {
	strictUrl?: boolean,
	bodyParser?: boolean
};

/**
 * The server.
 */
declare class Server {
	constructor(options: httpzOptions);

	/**
	 * Adds a middleware or a route to the list.
	 * ```js
	 * server.add((req, res, next) => {
	 *  req.ok = () => console.log("EEEE");
	 *  next();
	 * });
	 * ```
	 */
	add(param1: Group | ServerCallback): Server;

	/**
	 * Alias of http.Server.listen().
	 */
	listen(...p): void;

	middlewares: ({
		method: string[],
		url: string[] | RegExp,
		callbacks: Function[]
	} | Function)[];

	/**
	 * Adds a middleware associated with a route (that only works once).
	 * ```js
	 * server.one("*", "*", (req, res, next) => {
	 *  res.end("Goodbye forever.");
	 *  // Call the next middlewares.
	 *  next();
	 * });
	 * ```
	 */
	one(method: string | string[], url: string, ...callbacks: ServerCallback[]): Server;
	one(method: string | string[], url: string[], ...callbacks: ServerCallback[]): Server;
	one(method: string | string[], url: RegExp, ...callbacks: ServerCallback[]): Server;

	/**
	 * Adds a middleware associated with a route.
	 * ```js
	 * server.route("*", "*", (req, res, next) => {
	 *  res.end("Hello world!");
	 *  // Call the next middlewares.
	 *  next();
	 * });
	 * ```
	 */
	route(method: string | string[], url: string, ...callbacks: ServerCallback[]): Server;
	route(method: string | string[], url: string[], ...callbacks: ServerCallback[]): Server;
	route(method: string | string[], url: RegExp, ...callbacks: ServerCallback[]): Server

	server: httpServer

}
export = Server;
