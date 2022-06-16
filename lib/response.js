import { ServerResponse } from "http";

export default class Response extends ServerResponse {
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
}
