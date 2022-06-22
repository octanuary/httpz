import http from "http";
import Request from "./request.js";
import Response from "./response.js";
import Group from "./group.js";

/**
 * @typedef ServerCallback
 * @type {(req: Request, res: Response) => any}
 */



export default class Server {
	/**
	 *
	 * @param {{
	 * 	strictUrl?: boolean
	 * }} options settings for the server
	 */
	constructor(options = {}) {
		/**
		 * @type {({
		 * 	method: string[],
		 * 	url: string[],
		 * 	callbacks: Function[]
		 * } | Function)[]} 
		 */
		this.middlewares = [];
		this.options = options;

		// create the server
		this.server = http.createServer({
			IncomingMessage: Request,
			ServerResponse: Response
		}, async (req, res) => {
			// for some reason the request data isn't there??
			req.initialize();

			/**
			 * look for matches in the middleware array
			 */
			let count = 0;
			const matches = this.middlewares.filter(middleware => {
				if (typeof middleware === "function") return true;

				const methodT = req.method.toLowerCase();
				const methodS = middleware.method.map(m => m.toLowerCase());
				let urlT, urlS;
				// options.strictUrl makes urls case-sensitive
				if (this.options.strictUrl) {
					urlT = req.parsedUrl.pathname;
					urlS = middleware.url;
				} else {
					urlT = req.parsedUrl.pathname.toLowerCase();
					urlS = middleware.url.map(m => m.toLowerCase());
				}

				// check if the source arrays contain the target method/url
				const methodMatch = methodS[0] == "*" || methodS.includes(methodT);
				const urlMatch = urlS[0] == "*" || urlS.includes(urlT);

				// increase the count for normal routes
				count++;

				return methodMatch && urlMatch;
			}).map(mw => typeof mw == "function" ? mw : mw.callbacks).flat();
			if (count > 0) {				
				let count2 = -1;
				async function next() {
					count2++;
					await matches[count2](req, res, next);
				}

				// start the callbacks
				await next();
				return true;
			}
			if (!res.writableEnded) {
				res.statusCode = 404;
				res.end(`Cannot ${req.method} ${req.parsedUrl.pathname}.`);
			}
			return;
		});
	}
	address() {
		this.server.address();
	}
	listen(...p) {
		this.server.listen(...p);
	}

	/**
	 * Adds a middleware or a route to the list.
	 * @param {Group | (req: Request, res: Response, next: Promise<void>) => any} param1 
	 * @returns {Server}
	 */
	add(param1) {
		if (param1 instanceof Group)
			this.middlewares.push(...param1.middlewares);
		else
			this.middlewares.push(param1);
		return this;
	}

	/**
	 * Adds a groupless middleware associated with a route.
	 * @param {string | string[]} method 
	 * @param {string | string[]} url 
	 * @param {ServerCallback[]} callback 
	 */ 
	route(method, url, ...callback) {
		if (Array.isArray(method)) {
			if (method.includes("*")) {
				method = ["*"];
				return;
			}
			const validMethods = method.some(m => http.METHODS.includes(m));
			if (!validMethods)
				throw new Error("Method array must contain a valid method.");
		} else method = [method];
		if (Array.isArray(url)) {
			if (url.includes("*")) {
				url = ["*"];
				return;
			}
		} else if (url.includes("?"))
			url = [url.split("?")[0]]
		else url = [url];

		this.middlewares.push({
			method: method,
			url: url,
			callbacks: callback 
		});
		return this;
	}

	listen(port, ...callback) {
		this.server.listen(port);
	}
}
