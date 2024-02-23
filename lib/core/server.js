const http = require("http");
const Group = require("./group");
const Request = require("./request");
const Response = require("./response");

http.METHODS.push("*");

module.exports = class Server extends Group {
	/**
	 * 
	 * @param {?HttpzOptions} options 
	 */
	constructor(options) {
		super(options)

		this.server = http.createServer(
			{
				IncomingMessage: Request,
				ServerResponse: Response
			},
			(req, res) => this.filter(this, req, res)
		);
	}

	listen(...a) {
		this.server.listen(...a);
	}

	/**
	 * 
	 * @param {this} that 
	 * @param {Request} req 
	 * @param {Response} res 
	 */
	async filter(that, req, res) {
		// for some reason the request data isn't there??
		req.initialize();

		/** @type {ServerCallback[]} */
		let matches = [];
		for (const route of that.middlewares) {
			// all functions are global
			if (typeof route == "function") {
				matches.push(route);
				continue;
			}

			const reqMethod = req.method;
			const routeMethods = route.method;

			// check if the route's method array contains the request method
			const methodMatch = (
				routeMethods[0] == "*" ||
				routeMethods.includes(reqMethod)
			);

			let reqUrl = req.parsedUrl.pathname;
			let routeUrls = route.url;
			let matchFound = false;
			let urlToMatch = this.options.matchPathname == false ? req.url : reqUrl;

			if (routeUrls instanceof RegExp) {
				const urlMatches = urlToMatch.match(routeUrls);
				if (urlMatches) {
					req.matches = urlMatches;
					matchFound = true;
				}
			} else {
				for (let url of routeUrls) {
					// strictUrl makes it case-sensitive
					if (!that.options.strictUrl) {
						urlToMatch = urlToMatch.toLowerCase();
						url = url.toLowerCase();
					}

					if (url == "*" || url === urlToMatch) {
						matchFound = true;
						break;
					}
				}
			}

			// push all the functions because we don't need the match parameters anymore
			if (methodMatch && matchFound) {
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
					if (!(typeof e == "object" && e.httpz_silent_assertion)) {
						if (!that.options.catchUnhandledExceptions) {
							throw e;
						} else {
							console.error("Unhandled exception caught:", e);
						}
					}
					
					// end the request if it hasn't been already
					if (!res.writableEnded) {
						res.status(500);
						res.end();
					}
				}
			}

			next();
		} else {
			console.log(req.method, req.parsedUrl.pathname, this.middlewares);
		}
	}
};
