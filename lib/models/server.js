const http = require("http");
const Group = require("./group");
const Request = require("./request");
const Response = require("./response");
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

			let matches = [];
			for (const route of this.middlewares) {
				// all functions in routes are actually middlewares
				if (typeof route == "function") {
					matches.push(route);
					continue;
				}

				const reqMethod = req.method; // string
				const routeMethod = route.method; // array

				// check if the route's method array contain the request method
				const methodMatch = (
					routeMethod[0] == "*" ||
					routeMethod.includes(reqMethod)
				);

				let reqUrl = req.parsedUrl.pathname;
				let routeUrl = route.url;
				let urlMatch = false;
				
				for (let url of routeUrl) {
					if (url instanceof RegExp) {
						const match = reqUrl.match(url);
						if (match) {
							req.matches = match;
							urlMatch = true;
						}
						break;
					}
					
					// strictUrl makes it case-sensitive
					if (!this.#options.strictUrl) {
						reqUrl = reqUrl.toLowerCase();
						url = url.toLowerCase();
					}

					if (url == "*" || url === reqUrl) {
						urlMatch = true;
						break;
					}
				}

				if (methodMatch && urlMatch) {
					matches.push(...route.callbacks);
				}
				continue;
			}

			if (matches.length > 0) {			
				let x = -1;
				async function next() {
					x++;
					try {
						// we're done
						if (x >= matches.length) {
							return;
						}
						await matches[x](req, res, next);
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

				next();
			}
		});
	}

	#addRoute(method, url, ...callbacks) {
		if (typeof method == "string") {
			method = [method];
		}
		const validMethods = method.some((m) => http.METHODS.includes(m));
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
		} else {
			url = [url];
		}

		this.middlewares.push({
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

	route(...p) {
		this.#addRoute(...p);
		return this;
	}
};
