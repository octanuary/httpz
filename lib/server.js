import http from "http";
import Request from "./request.js";
import Response from "./response.js";
import Group from "./group.js";

/**
 * @typedef ServerCallback
 * @type {(req: http.IncomingMessage, res: http.OutgoingMessage) => any}
 */



export default class Server {
	/**
	 *
	 * @param {{
	 * 	strictUrl?: boolean
	 * }} options settings for the server
	 */
	constructor(options = {}) {
		this.middlewares = [];
		this.errHandlers = [];
		this.options = options;
	}

	add(param1) {
		if (param1 instanceof Group)
			this.middlewares.push(...param1.middlewares);
		else {
			this.middlewares.push(param1);
		}
	}

	/**
	 * Adds a groupless middleware associated with a route.
	 * @param {string} method 
	 * @param {string} url 
	 * @param {} callback 
	 */ 
	route(method, url, ...callback) {
		this.middlewares.push({
			method: method,
			url: url,
			callbacks: callback 
		});
		return this;
	}

	/**
	 * Adds an error handler.
	 * @param {number} sCode 
	 * @param  {ServerCallback} callback 
	 */
	error(sCode, callback) {
		this.errHandlers.push({
			sCode,
			callback 
		});
		return this;
	}

	listen(port, ...callback) {
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
				const methodT = middleware.method.toLowerCase();
				let urlS, urlT;
				if (this.options.strictUrl) {
					urlS = req.parsedUrl.pathname;
					urlT = middleware.url;
				} else {
					urlS = req.parsedUrl.pathname.toLowerCase();
					urlT = middleware.url.toLowerCase();
				}

				const methodMatch = methodT == "*" || methodT == methodS;
				const urlMatch = urlT == "*" || urlT == urlS;
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
		this.server.listen(port);
		console.log(`Listening on port ${port}.`)
	}
}
