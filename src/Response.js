module.exports = class Response {
	constructor (res) {
		// the res obj passed by http.request to the resHandler
		this.coreRes = res;
		this.body = Buffer.alloc(0);

		this.headers = res.headers;
		this.statusCode = res.statusCode;
	}

	_addChunk (chunk) {
		this.body = Buffer.concat([this.body, chunk]);
	}

	// return a js object from a json body
	async json () {
		return JSON.parse(this.body);
	}

	async text () {
		return this.body.toString();
	}
}
