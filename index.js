const Request = require('./src/Request.js');

module.exports = (url, method) => {
	return new Request(url, method);
}
