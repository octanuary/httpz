const errors = require("../util/errors.json");

module.exports = class Group {
	constructor(options = {}) {
		this.middlewares = [];
		this.options = options;
	}
	
	/**
	 * Adds a middleware associated with a route.
	 * @param {string | string[]} method 
	 * @param {string | string[] | RegExp} url 
	 * @param {((req: httpz.Request, res: httpz.Response, next: Function) => any)[]} callback 
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
