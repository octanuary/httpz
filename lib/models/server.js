// modules
const http = require("node:http");
// stuff
const Group = require("./group");
const Request = require("./request");
const Response = require("./response");
// vars
const errors = require("../util/errors");

/**
 * @typedef ServerCallback
 * @type {(req: Request, res: Response) => any}
 */

module.exports = class Server {
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

				const methodT = req.method;
				const methodS = middleware.method.map(m => m.toUpperCase());
				let urlT, urlS, urlMatch = false;
				// options.strictUrl makes urls case-sensitive
				if (this.options.strictUrl || middleware.url instanceof RegExp) {
					urlT = req.parsedUrl.pathname;
					urlS = middleware.url;

					const match = urlT.match(urlS);
					if (match) {
						req.matches = match;
						urlMatch = true;
					}
				} else {
					urlT = req.parsedUrl.pathname.toLowerCase();
					urlS = middleware.url.map(m => m.toLowerCase());

					urlMatch = urlS[0] == "*" || urlS.includes(urlT);
				}

				// check if the source arrays contain the target method
				const methodMatch = methodS[0] == "*" || methodS.includes(methodT);

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
	 * @param {string | string[] | RegExp} url 
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
		// check if the url is regex
		if (!(url instanceof RegExp)) {
			if (typeof url == "string")
				url = url.includes("?") ? [url.split("?")[0]] : [url];
			else if (Array.isArray(url)) {
				if (url.includes("*"))
					url = ["*"];
			} else throw new TypeError(errors.invalidUrlType);
		}

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
};
