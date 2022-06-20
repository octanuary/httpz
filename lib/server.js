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
			const matches = this.middlewares.filter(middleware => {
				if (typeof middleware === "function") return false;

				const methodS = req.method.toLowerCase();
				const methodT = middleware.method.map(m => m.toLowerCase());
				let urlS, urlT;
				// options.strictUrl makes urls case-sensitive
				if (this.options.strictUrl) {
					urlS = req.parsedUrl.pathname;
					urlT = middleware.url;
				} else {
					urlS = req.parsedUrl.pathname.toLowerCase();
					urlT = middleware.url.map(m => m.toLowerCase());
				}

				const methodMatch = methodT[0] == "*" || methodT.includes(methodS);
				const urlMatch = urlT[0] == "*" || urlT.includes(urlS);
				return methodMatch && urlMatch;
			});
			let found = this.middlewares.filter(m => typeof m == "function");
			if (matches.length != 0) {
				found.push(...matches);
				let nextRes = [];
				// the next function is just a promise that
				// resolves when all the middlewares are called
				const next = () =>
					new Promise((resolve, reject) => 
						nextRes.push(resolve));
				// go through all the middlewares
				for (let index in found) {
					const mid = found[index];
					if (typeof mid == "function") {
						mid(req, res, next);
					} else {
						for (let index2 in mid.callbacks) {
							const cb = mid.callbacks[index2];
							await cb(req, res, next);
						}
					}
				}
				nextRes.forEach(resolve => resolve());
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
		} else url = [url];

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
