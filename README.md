# httpz
HTTPz (htt-peasy) is a lightweight HTTP framework for Node.js.

# Quick Start
To use HTTPz, install it as a dependency in your project, then add some code.

## Example
```js
import httpz from "httpz";

const server = new httpz.Server();

server
	.route("GET", "/", async (req, res) => {
		res.end("Hello World!");
	})
	.listen(5000);
```
