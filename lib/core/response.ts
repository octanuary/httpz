import { IncomingMessage, ServerResponse } from "http";

class Response<Request extends IncomingMessage = IncomingMessage> extends ServerResponse<Request> {
	constructor(req:Request) {
		super(req);
	}

	/**
	 * Checks if the value is `true`. If not, it terminates all pending middlewares.
	 * ```
	 * req.assert(400, "Missing one or more fields.", req.body.password1);
	 * ```
	 */
	assert(...args: [status: number, data: any, ...value: any[]]): this {
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
	 * Stringifies the object and returns it.
	 * ```js
	 * res.json({
	 * 	success: 0,
	 * 	msg: "RETRACT IT FROM THE SERVER!"
	 * });
	 * ```
	 */
	json(data:object) : this {
		const json = JSON.stringify(data);
		this.setHeader("Content-Type", "application/json");
		this.end(json);
		return this;
	}

	/**
	 * Sets the "Location" header and the status code (if specified).
	 * ```js
	 * res.redirect(301, "/newapi/do/something");
	 * ```
	 */
	redirect(status:number, url:string) : this
	redirect(url:string) : this
	redirect(param1:any, param2?:any) : this {
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
	 * Sets the status code.
	 * ```js
	 * const toecount = req.body.toes;
	 * if (toecount > 10) {
	 *  res.status(400);
	 *  res.end(`But Mr. Schneider, I don't have ${toecount} toes. I only have 10!`);
	 * }
	 * ```
	 */
	status(status:number) : this {
		this.statusCode = status;
		return this;
	};
}
export default Response;
