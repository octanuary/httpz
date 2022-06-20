export default class Group {
	constructor(options = {}) {
		this.middlewares = [];
		this.options = options;
	}
	
	/**
	 * Adds a middleware associated with a route.
	 * @param {string | string[]} method 
	 * @param {string | string[]} url 
	 * @param {Function[]} callback 
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
		if (Array.isArray(url)) {
			if (url.includes("*")) {
				url = ["*"];
				return;
			}
		} else url = [url];

		this.middlewares.push({
			method: method,
			url: url,
			callbacks: callback 
		});
		return this;
	}
}
