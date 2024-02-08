const { ServerResponse } = require("http");

module.exports = class Response extends ServerResponse {
	constructor(req) {
		super(req);
	}

	/**
	 * 
	 * @param  {...[status: number, data: any, ...value: any[]]} args 
	 * @returns {this}
	 */
	assert(...args) {
		const res = args.splice(0, 2);

		for (const valIn in args) {
			const value = args[valIn];
			if (!!value) {
				continue;
			}

			// end all middlewares
			this.status(res[0]);
			if (typeof res[1] == "object") {
				this.json(res[1]);
			} else {
				this.end(res[1]);
			}
			throw { httpz_silent_assertion: true };
		}
		return this;
	}

	/**
	 * 
	 * @param {object} data 
	 * @returns {this}
	 */
	json(data) {
		const json = JSON.stringify(data);
		this.setHeader("Content-Type", "application/json");
		this.end(json);
		return this;
	}

	/**
	 * 
	 * @param {number | string} param1 
	 * @param {?string} param2 
	 * @returns 
	 */
	redirect(param1, param2) {
		let status = 302;
		let route = "";

		if (typeof param1 == "number") {
			status = param1;
			if (typeof param2 == "string") {
				route = param2;
			} else {
				throw new Error("Expected type 'string' for param2 if param1 is type 'number'. Got " + typeof param1)
			}
		} else if (typeof param1 == "string") {
			route = param1;
		} else {
			throw new Error("Expected type 'number' (status code) or 'string' (pathname) for param1. Got " + typeof param1);
		}

		this.status(status);
		this.setHeader("Location", route);
		this.end();
		return this;
	}

	/**
	 * 
	 * @param {number} status 
	 * @returns {this}
	 */
	status(status) {
		this.statusCode = status;
		return this;
	};
};
