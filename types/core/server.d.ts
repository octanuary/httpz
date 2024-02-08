import http from "http";
import Group, { HttpzOptions } from "./core/group";
import Request from "./request";
import Response from "./response";

export default class Server extends Group {
	server:http.Server<typeof Request, typeof Response>;
	listen: typeof http.Server.prototype.listen;

	constructor(options?:HttpzOptions);

	private filter(that:this, req:Request, res:Response): Promise<void>;
}
