import Group from "./models/group";
import Request from "./models/request";
import Response from "./models/response";
import Server from "./models/server";

declare module "@octanuary/httpz";
export {
	Group,
	Request,
	Response,
	Server
};
