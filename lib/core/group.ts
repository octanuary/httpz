import http from "http";
import Request from "./request";
import Response from "./response";
import errors from "../util/errors.json";

export type ServerCallback<HasRegexUrl = unknown> = (req: Request<HasRegexUrl>, res: Response, next: () => Promise<void>) => any;
export type Middleware = {
	method: string[],
	url: string[] | RegExp,
	callbacks: ServerCallback[]
};
export type Method = [
	'ACL',         'BIND',       'CHECKOUT',
	'CONNECT',     'COPY',       'DELETE',
	'GET',         'HEAD',       'LINK',
	'LOCK',        'M-SEARCH',   'MERGE',
	'MKACTIVITY',  'MKCALENDAR', 'MKCOL',
	'MOVE',        'NOTIFY',     'OPTIONS',
	'PATCH',       'POST',       'PROPFIND',
	'PROPPATCH',   'PURGE',      'PUT',
	'REBIND',      'REPORT',     'SEARCH',
	'SOURCE',      'SUBSCRIBE',  'TRACE',
	'UNBIND',      'UNLINK',     'UNLOCK',
	'UNSUBSCRIBE', '*'
][any];
export type HttpzOptions = {
	/**
	 * Enables case-sensitive path checking. Defaults to `true`.
	 */
	strictUrl: boolean,

	/**
	 * Compares request to req.parsedUrl.pathname instead of req.url. Defaults to `true`.
	 */
	matchPathname: boolean,

	/**
	 * Catch all unhandled exceptions. Defaults to `false`.
	 */
	catchUnhandledExceptions: boolean
};

export default class Group {
	options:HttpzOptions;
	middlewares: (Middleware | ServerCallback)[];

	constructor(options:HttpzOptions = {
		strictUrl:true,
		matchPathname:true,
		catchUnhandledExceptions: false}
	) {
		this.middlewares = [];
		this.options = options;
	}

	/**
	 * Adds a middleware or merges a group into to the list.
	 * ```js
	 * server.add((req, res, next) => {
	 *  req.ok = () => console.log("EEEE");
	 *  next();
	 * });
	 * ```
	 */
	add(param1:Group | ServerCallback): this {
		if (param1 instanceof Group) {
			this.middlewares.push(...param1.middlewares);
		} else if (typeof param1 == "function") {
			this.middlewares.push(param1);
		} else {
			throw new Error("Expected type 'httpz.Group | function' for param1. Got " + typeof param1);
		}
		return this;
	}

	/**
	 * Adds a middleware associated with a route.
	 * ```js
	 * server.route("*", "*", (req, res, next) => {
	 *  res.end("Hello world!");
	 *  // Call the next middlewares.
	 *  next();
	 * });
	 * ```
	 */
	// @ts-ignore
	route(method:Method | Method[], url:RegExp, ...callbacks:ServerCallback<RegExpMatchArray>[]): this
	route(method:Method | Method[], url:string | string[] | RegExp, ...callbacks:ServerCallback[]): this
	route(method:string | string[], url:string | string[] | RegExp, ...callbacks:ServerCallback[]): this {
		// convert request methods to uppercase
		if (typeof method == "string") {
			method = [method.toUpperCase()];
		} else if (Array.isArray(method)) {
			method = method.map((m) => m.toUpperCase());
		} else {
			throw new Error("Expected type 'string | string[]' for method. Got " + typeof method);
		}
		const validMethods = method.some((m) => http.METHODS.includes(m));
		if (!validMethods) {
			throw new Error(errors.invalidMethod);
		}

		if (typeof url == "string") {
			url = [url];
		} else if (!Array.isArray(url) && !(url instanceof RegExp)) {
			throw new TypeError(errors.invalidUrlType);
		}

		this.middlewares.push({
			method,
			url,
			callbacks
		});
		return this;
	}
};
