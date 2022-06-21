
/**
 * 
 * @param {httpz.Request} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export default async function(req, res, next) {
	const start = Date.now();
	await next();
	const duration = Date.now() - start;
	console.log(`${req.method} ${req.url} ${duration}ms`);
	return;
}