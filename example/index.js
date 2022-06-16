import kitdog from "../index.js";
import isok from "./routes/group.js";
import restime from "./middlewares/responseTime.js";
import user from "./middlewares/user.js";

const server = new kitdog.Server();

// add middleware
server.add(restime);
server.add(user)

// add groups of routes
server.add(isok);



server.route("GET", "/", async (req, res) => {
	res.json({
		status: "ok",
		data: `Hello, ${req.user?.name}!`
	});
	return;
});

server.route("*", "*", async (req, res) => {
	if (!res.writableEnded) {
		res.json({
			status: "error",
			data: "Not found"
		});
	}
	return;
});


server.listen(5000);