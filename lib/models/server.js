// modules
const http = require("node:http");
// stuff
const Group = require("./group");
const Request = require("./request");
const Response = require("./response");
// vars
const errors = require("../util/errors");

http.METHODS.push("*");

module.exports = class Server {
	#options;

	constructor(options = {}) {
		this.middlewares = [];
		this.#options = options;

		// create the server
		this.server = http.createServer({
			IncomingMessage: Request,
			ServerResponse: Response
		},
		/** @type {ServerCallback} */
		async (req, res) => {
			// for some reason the request data isn't there??
			req.initialize();

			/**
			 * look for matches in the middleware array
			 */
			const matches = this.middlewares
				.filter((middleware, index) => {
					if (typeof middleware == "function") return true;

					const methodT = req.method;
					const methodS = middleware.method.map(m => m.toUpperCase());

					// check if the source arrays contain the target method
					const methodMatch = methodS[0] == "*" || methodS.includes(methodT);
					if (!methodMatch) return false;

					let urlT = req.parsedUrl.pathname;
					let urlS = middleware.url;
					let urlMatch = false;

					if (urlS instanceof RegExp) {
						const match = urlT.match(urlS);
						if (match) {
							req.matches = match;
							urlMatch = true;
						}
					} else {
						for (const urlIn in urlS) {
							let url = urlS[urlIn];
							
							// strictUrl makes it case-sensitive
							if (!this.#options.strictUrl) {
								urlT = urlT.toLowerCase();
								url = url.toLowerCase();
							}
	
							if (url == "*" || url === urlT) {
								urlMatch = true;
								break;
							}
						}
					}

					// delete single use routes
					if (methodMatch && urlMatch && middleware.isOnce) {
						this.middlewares.splice(index, 1);
					}

					return methodMatch && urlMatch;
				})
				.map(mw => typeof mw == "function" ? mw : mw.callbacks)
				.flat();
			if (matches.length > 0) {				
				let count2 = -1;
				async function next() {
					count2++;
					try {
						if (count2 >= matches.length) return;
						await matches[count2](req, res, next);
					} catch (e) {
						if (!(typeof e == "object" && e.quiet)) {
							console.error("HTTPz error:", e);
						}
						// end the request if it hasn't been already
						if (!res.writableEnded) {
							res.status(500);
							res.end();
						}
					}
				}

				// start the callbacks
				await next();
			}
			return;
		});
	}

	#addRoute(isOnce, method, url, ...callbacks) {
		if (typeof method == "string") {
			method = [method];
		}
		const validMethods = method.some(m => http.METHODS.includes(m));
		if (!validMethods) {
			throw new Error(errors.invalidMethod);
		}

		// check if the url is regex
		if (!(url instanceof RegExp)) {
			if (typeof url == "string") {
				// ignore query string
				if (url.includes("?")) {
					url = [url.split("?")[0]];
				} else {
					url = [url];
				}
			} else if (!Array.isArray(url)) {
				throw new TypeError(errors.invalidUrlType);
			}
		}

		this.middlewares.push({
			isOnce,
			method,
			url,
			callbacks
		});
	}

	add(param1) {
		if (param1 instanceof Group)
			this.middlewares.push(...param1.middlewares);
		else
			this.middlewares.push(param1);
		return this;
	}
	
	listen(...p) {
		this.server.listen(...p);
	}

	one(...p) {
		this.#addRoute(true, ...p);
		return this;
	}

	route(...p) {
		this.#addRoute(false, ...p);
		return this;
	}
};
