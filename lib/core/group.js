const http = require("http");
const errors = require("../util/errors.json");

module.exports = class Group {
	/**
	 * 
	 * @param {HttpzOptions} options 
	 */
	constructor(options = {
		strictUrl:true,
		matchPathname:true,
		catchUnhandledExceptions: false}
	) {
		this.middlewares = [];
		this.options = options;
	}

	/**
	 * 
	 * @param {Group | ServerCallback} param1 
	 * @returns {this}
	 */
	add(param1) {
		if (param1 instanceof Group) {
			this.middlewares.push(...param1.middlewares);
		} else if (typeof param1 == "function") {
			this.middlewares.push(param1);
		} else {
			throw new Error("Expected type 'httpz.Group | function' for param1. Got " + typeof param1);
		}
		return this;
	}

	/**
	 * 
	 * @param {string | string[]} method 
	 * @param {string | string[] | RegExp} url 
	 * @param  {...ServerCallback[]} callbacks 
	 * @returns {this}
	 */
	route(method, url, ...callbacks) {
		// convert request methods to uppercase
		if (typeof method == "string") {
			method = [method.toUpperCase()];
		} else if (Array.isArray(method)) {
			method = method.map((m) => m.toUpperCase());
		} else {
			throw new Error("Expected type 'string | string[]' for method. Got " + typeof method);
		}
		const validMethods = method.some((m) => http.METHODS.includes(m));
		if (!validMethods) {
			throw new Error(errors.invalidMethod);
		}

		if (typeof url == "string") {
			url = [url];
		} else if (!Array.isArray(url) && !(url instanceof RegExp)) {
			throw new TypeError(errors.invalidUrlType);
		}

		this.middlewares.push({
			method,
			url,
			callbacks
		});
		return this;
	}
};
