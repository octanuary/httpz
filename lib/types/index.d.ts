import Group from "./types/group";
import Request from "./types/request";
import Response from "./types/response";
import Server from "./types/server";

declare module "@octanuary/httpz";
export {
	Group,
	Request,
	Response,
	Server
};
