/*!
 * httpz.Response
 * Author: octanuary
 * License: MIT
 */
const { ServerResponse } = require("http");

module.exports = class Response extends ServerResponse {
	constructor(req) {
		super(req);
		return this;
	}

	assert(...args) {
		const res = args.splice(-2, 2);

		for (const valIn in args) {
			const value = args[valIn];
			if (!!value) {
				continue;
			}

			// end all callbacks and middlewares
			this.status(res[0]);
			this.end(res[1]);
			throw { quiet: true };
		}
	}

	json(data) {
		const json = JSON.stringify(data);
		this.setHeader("Content-Type", "application/json");
		this.end(json);
	}

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

	status(status) {
		this.statusCode = status;
		return this;
	};
};
