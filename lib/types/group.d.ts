import Request from "./request";
import Response from "./response";

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

	constructor(options:HttpzOptions);

	/**
	 * Adds a middleware or merges a group into to the list.
	 * ```js
	 * server.add((req, res, next) => {
	 *  req.ok = () => console.log("EEEE");
	 *  next();
	 * });
	 * ```
	 */
	add(param1:Group | ServerCallback): this;

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
	route(method:Method | Method[], url:string | string[] | RegExp, ...callbacks:ServerCallback<undefined>[]): this;
}
