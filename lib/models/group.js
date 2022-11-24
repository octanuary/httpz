const http = require("http");
const errors = require("../util/errors.json");

module.exports = class Group {
	constructor(options = {}) {
		this.middlewares = [];
		this.options = options;
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

	add(param1) {
		if (param1 instanceof Group) {
			this.middlewares.push(...param1.middlewares);
		} else {
			this.middlewares.push(param1);
		}
		return this;
	}

	route(...a) {
		this.#addRoute(...a);
		return this;
	}
};
