/**
 * example server routes
 */
// stuff
import httpz from "../lib/index.js";

// create a new route group
const group = new httpz.Group();

group
	.route("GET", "/OK", (async (req, res) => {
		let ok = false;
		if (req.query.ok) ok = true;

		res.end(ok ? "everything's gonna be fine" : "THIS IS HORRIBLE! YOU'RE HORRIBLE! EVERYTHING'S HORRIBLE!");
		return;
	}))
	.route("*", "/user", async (req, res) => {
		res.json(req.user);
	})
	.route("GET", "/", async (req, res) => {
		res.json({
			status: "ok",
			data: `Hello, ${req.user?.name}!`
		});
	})

export default group;
