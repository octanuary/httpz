import kitdog from "../../index.js";

// create a new route group
const group = new kitdog.Group();

group.route("GET", "/OK", async (req, res) => {
	let ok = false;
	if (req.query.ok) ok = true;

	res.end(ok ? "everything's gonna be fine" : "THIS IS HORRIBLE! YOU'RE HORRIBLE! EVERYTHING'S HORRIBLE!");
	return;
});

group.route("*", "/user", async (req, res) => {
	res.json(req.user);
});

export default group;
