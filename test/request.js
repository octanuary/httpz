import assert from "node:assert";
import kitdog from "../index.js";
import request from "supertest";
const server = new kitdog.Server();
server.listen(1035);

describe("Request", function () {
	describe("#cookies", () => {
		it("should return all the cookies", function (done) {
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
