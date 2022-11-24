// modules
const http = require("http");
const Request = require("./request");
const Response = require("./response");
const errors = require("../util/errors.json");

/**
 * @typedef ServerCallback
 * @type {(req: Request, res: Response, next: Function) => any}
 */

module.exports = class Group {
	constructor(options = {}) {
		this.middlewares = [];
		this.options = options;
	}

	/**
	 * Adds a middleware or a route to the list.
	 * @param {Group | ServerCallback} param1 
	 * @returns {Server}
	 */
	add(param1) {
		if (param1 instanceof Group)
			this.middlewares.push(...param1.middlewares);
		else
			this.middlewares.push(param1);
		return this;
	}
	
	#addRoute(method, url, ...callbacks) {
		// convert request methods to uppercase
		if (typeof method == "string") {
			method = [method.toUpperCase()];
		} else {
			method = method.map((m) => m.toUpperCase());
		}
		const validMethods = method.some((m) => http.METHODS.includes(m));
		if (!validMethods) {
			throw new Error(errors.invalidMethod);
		}

		if (url instanceof RegExp || typeof url == "string") {
			url = [url];
		} else if (!Array.isArray(url)) {
			throw new TypeError(errors.invalidUrlType);
		}

		this.middlewares.push({
			method,
			url,
			callbacks
		});
	}

	route(...p) {
		this.#addRoute(...p);
		return this;
	}
};
