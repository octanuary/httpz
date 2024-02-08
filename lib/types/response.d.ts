import { IncomingMessage, ServerResponse } from "http";

export default class Response<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
	constructor(req:Request);

	/**
	 * Checks if the value is `true`. If not, it terminates all pending middlewares.
	 * ```
	 * req.assert(400, "Missing one or more fields.", req.body.password1);
	 * ```
	 */
	assert(...args: [status: number, data: any, ...value: any[]]): this;

	/**
	 * Stringifies the object and returns it.
	 * ```js
	 * res.json({
	 * 	success: 0,
	 * 	msg: "RETRACT IT FROM THE SERVER!"
	 * });
	 * ```
	 */
	json(data:object): this;

	/**
	 * Sets the "Location" header and the status code (if specified).
	 * ```js
	 * res.redirect(301, "/newapi/do/something");
	 * ```
	 */
	redirect(status:number, url:string): this
	redirect(url:string): this;

	/**
	 * Sets the status code.
	 * ```js
	 * const toecount = req.body.toes;
	 * if (toecount > 10) {
	 *  res.status(400);
	 *  res.end(`But Mr. Schneider, I don't have ${toecount} toes. I only have 10!`);
	 * }
	 * ```
	 */
	status(status:number): this;
}
