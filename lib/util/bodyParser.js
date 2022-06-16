/**
 * request body parser
 */

export default function (req) {
	return new Promise((res, rej) => {
		var data = "";
		var parsed;

		req.on("data", v => {
			data += v
			if (data.length > 1e10) {
				data = "";
				res.writeHead(413);
				res.end();
				req.connection.destroy();
				rej();
			}
		});

		req.on("end", () => {
			try {
				parsed = JSON.parse(data.toString());
			} catch (e) {
				const params = new URLSearchParams(data.toString());
				parsed = Object.fromEntries(params);
			}
			res(parsed)
		});
	});
}