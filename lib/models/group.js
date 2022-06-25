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
			} else throw new Error(errors.invalidUrlType);
		}

		this.middlewares.push({
			method: method,
			url: url,
			callbacks: callback 
		});
		return this;
	}
};
