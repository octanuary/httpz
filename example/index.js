/**
 * HTTPz example server
 * Author: octanuary#6553
 * License: MIT
 */
// stuff
import httpz from "../lib/index.js";
import routes from "./routes.js";
// middlewares
import restime from "./middlewares/responseTime.js";
import user from "./middlewares/user.js";

const server = new httpz.Server();

server
	// add middlewares
	.add(restime)
	.add(user)
	// add groups of routes
	.add(routes)
	// 404
	.route("*", "*", async (req, res) => {
		if (!res.writableEnded) {
			res
				.status(404)
				.json({
					status: "error",
					data: "Not found"
				});
		}
	})
	.listen(5000);