export default class Group {
	constructor(options = {}) {
		this.middlewares = [];
		this.options = options;
	}
	
	/**
	 * Adds a middleware associated with a route.
	 * @param {string} method 
	 * @param {string} url 
	 * @param {Function[]} callback 
	 */
	route(method, url, ...callback) {
		this.middlewares.push({
			method: method,
			url: url,
			callbacks: callback 
		});
		return this;
	}
}
