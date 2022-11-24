/*!
 * httpz.Group
 * Author: octanuary
 * License: MIT
 */
import Request from "./request.js";
import Response from "./response.js";

declare type ServerCallback = (req: Request, res: Response, next: Promise<any>) => any;

/**
 * The server.
 */
declare class Group {
	constructor();

	/**
	 * Adds a middleware or a route to the list.
	 * ```js
	 * server.add((req, res, next) => {
	 *  req.ok = () => console.log("EEEE");
	 *  next();
	 * });
	 * ```
	 */
	add(param1: Group | ServerCallback): Group;

	middlewares: ({
		method: string[],
		url: string[] | RegExp,
		callbacks: Function[]
	} | Function)[];

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
	route(method: string | string[], url: string, ...callbacks: ServerCallback[]): Group;
	route(method: string | string[], url: string[], ...callbacks: ServerCallback[]): Group;
	route(method: string | string[], url: RegExp, ...callbacks: ServerCallback[]): Group

}
export = Group;
