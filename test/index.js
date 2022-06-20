import assert from "node:assert";
import request from "supertest";
import kitdog from "../index.js";
const server = new kitdog.Server();
server.listen(1035);

describe("Server", function () {
	describe(".route", () => {
		it("should add the route to Server.middlewares", done => {
			server.route("GET", "/server-route-mwArrayTest", (req, res) => 
				res.end("world"));

			const middleware = server.middlewares.find(m => {
				return m.method == "GET" &&
				m.url == "/server-route-mwArrayTest"
			});

			// look for the middleware
			done(assert.equal(typeof middleware, "object"));
		});
		it("should accept an array of methods", done => {
			server.route(["GET", "DELETE"], "/server-route-methodArray", (req, res) => 
				res.end("world"));

			request(server.server)
				.get("/server-route-methodArray")
				.end(e => {
					if (e) {
						done(e);
						return;
					};

					request(server.server)
						.delete("/server-route-methodArray")
						.expect("world", done);
				});
		});
		it("should accept an array of urls", done => {
			server.route("*", ["/server-route-urlArray1", "/server-route-urlArray2"], (req, res) => 
				res.end("world"));

			request(server.server)
				.get("/server-route-urlArray1")
				.end((e, res) => {
					if (e) {
						done(e);
						return;
				 	};
					assert.equal(res.text, "world");

					request(server.server)
						.get("/server-route-urlArray2")
						.expect("world", done);
				});
		});
		it("should return the expected response", done => {
			server.route("POST", "/hello", (req, res) => 
				res.status(420).end("world"));

			request(server.server)
				.post("/hello")
				.expect(420, "world", done);
		});
	});
});

describe("Request", function () {
	describe(".cookies", () => {
		it("should return all the cookies", done => {
			server.route("*", "/cookies", (req, res) => 
				res.json(req.cookies));

			request(server.server)
				.get("/cookies")
				.set("Cookie", "cookie1=hello; cookie2=world;cookie3=hellouser")
				.expect(200, {
					cookie1: "hello",
					cookie2: "world",
					cookie3: "hellouser"
				}, done);
		});
	});
});

