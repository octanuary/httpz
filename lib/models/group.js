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
	
	/**
	 * Adds a middleware associated with a route.
	 * @param {string | string[]} method 
	 * @param {string | string[] | RegExp} url 
	 * @param {ServerCallback[]} callback 
	 */
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
		} else {
			url = [url];
		}

		this.middlewares.push({
			isOnce,
			method,
			url,
			callbacks
		});
	}

	route(...p) {
		this.#addRoute(false, ...p);
		return this;
	}

	one(...p) {
		this.#addRoute(true, ...p);
		return this;
	}
};
