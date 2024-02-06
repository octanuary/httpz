import http from "http";
import Group, { HttpzOptions, ServerCallback } from "./group";
import Request from "./request";
import Response from "./response";

http.METHODS.push("*");

export default class Server extends Group {
	server:http.Server<typeof Request, typeof Response>;
	listen: typeof http.Server.prototype.listen;

	constructor(options?:HttpzOptions) {
		super(options)

		this.server = http.createServer(
			{
				IncomingMessage: Request,
				ServerResponse: Response
			},
			(req:Request, res:Response) => this.filter(this, req, res)
		);
		this.listen = this.server.listen;
	}

	private async filter(that:this, req:Request, res:Response) {
		// for some reason the request data isn't there??
		req.initialize();

		let matches:ServerCallback[] = [];
		for (const route of that.middlewares) {
			// all functions are global
			if (typeof route == "function") {
				matches.push(route);
				continue;
			}

			const reqMethod = req.method as string;
			const routeMethods = route.method;

			// check if the route's method array contains the request method
			const methodMatch = (
				routeMethods[0] == "*" ||
				routeMethods.includes(reqMethod)
			);

			let reqUrl = req.parsedUrl.pathname;
			let routeUrls = route.url;
			let matchFound = false;
			let urlToMatch = this.options.matchPathname == false ? req.url as string : reqUrl;

			if (routeUrls instanceof RegExp) {
				const urlMatches = urlToMatch.match(routeUrls);
				if (urlMatches) {
					req.matches = urlMatches;
					matchFound = true;
				}
			} else {
				for (let url of routeUrls) {
					// strictUrl makes it case-sensitive
					if (!that.options.strictUrl) {
						urlToMatch = urlToMatch.toLowerCase();
						url = url.toLowerCase();
					}

					if (url == "*" || url === urlToMatch) {
						matchFound = true;
						break;
					}
				}
			}

			// push all the functions because we don't need the match parameters anymore
			if (methodMatch && matchFound) {
				matches.push(...route.callbacks);
			}
			continue;
		}

		if (matches.length > 0) {			
			let x = -1;
			async function next() {
				x++;
				try {
					// we're done
					if (x >= matches.length) {
						return;
					}
					await matches[x](req, res, next);
				} catch (e:any) {
					if (!(typeof e == "object" && e.httpz_silent_assertion)) {
						if (!that.options.catchUnhandledExceptions) {
							throw e;
						} else {
							console.error("Unhandled exception caught:", e);
						}
					}
					
					// end the request if it hasn't been already
					if (!res.writableEnded) {
						res.status(500);
						res.end();
					}
				}
			}

			next();
		} else {
			console.log(req.method, req.parsedUrl.pathname, this.middlewares);
		}
	}
};
