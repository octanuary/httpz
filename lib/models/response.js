const { ServerResponse } = require("http");

module.exports = class Response extends ServerResponse {
	constructor(req) {
		super(req);
	
		return this;
	}

	/**
	 * 
	 * @param {object} data 
	 */
	json(data) {
		const json = JSON.stringify(data);
		this.setHeader("Content-Type", "application/json");
		this.end(json);
	}

	/**
	 * Redirects a request.
	 * @param {number | string} param1 A status code or route.
	 * @param {string | void} param2 A route. (if param1 is a status code)
	 */
	redirect(param1, param2) {
		let status = 302;
		let route = "/";

		if (typeof param1 == "number") {
			status = param1;
			route = param2;
		} else route = param1;

		this.status(status);
		this.setHeader("Location", route);
		this.end();
	}

	/**
	 * Sets the status code.
	 * @param {number} status
	 */
	status(status) {
		this.statusCode = status;
		return this;
	};
};
