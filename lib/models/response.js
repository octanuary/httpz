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
	 * Sets the status code.
	 * @param {number} status
	 */
	status(status) {
		this.statusCode = status;
		return this;
	};
};
