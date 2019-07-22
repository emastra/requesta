const path = require('path');
const http = require('http');
const https = require('https');
const qs = require('querystring');
const zlib = require('zlib');
const {URL} = require('url');

const { checkParamOrThrow } = require('./utils');

const Response = require('./Response.js')

const supportedCompressions = ['gzip', 'deflate'];

class Request {
	constructor (url, method = 'GET') {
    // params to checkParamOrThrow: value, name , type, errMess
    checkParamOrThrow(url, 'url', 'String');
    checkParamOrThrow(method, 'method', 'String');

		// this.url = typeof url === 'string' ? new URL(url) : url
    this.url = new URL(url);
		this.method = method;
		this.data = null;
		this.sendDataAs = null;
		this.reqHeaders = {};
		this.streamEnabled = false;
		this.compressionEnabled = false;
		this.timeoutTime = null;
		this.coreOptions = {};

		return this;
	}

  // passi o un solo oggetto con key/value per query, o due strings che saranno key e value
	// aggiunge querystring all url. querystring formato da una o piu coppie di key/value
	query (a1, a2) {
		checkParamOrThrow(a1, 'a1', 'Object | String');
		checkParamOrThrow(a2, 'a2', 'String | Undefined');

		if (typeof a1 === 'object') {
			Object.keys(a1).forEach((queryKey) => {
				this.url.searchParams.append(queryKey, a1[queryKey]);
			});
		}
		else this.url.searchParams.append(a1, a2);

		return this;
	}

	// add the relativePath to pathname
	path (relativePath) {
		checkParamOrThrow(relativePath, 'relativePath', 'String');

		this.url.pathname = path.join(this.url.pathname, relativePath);

		return this;
	}

	// set this.sendDataAs correctly and set this.data stringifying if necessary
	body (data, sendAs) {
		checkParamOrThrow(data, 'data', 'Object | String');
		checkParamOrThrow(sendAs, 'sendAs', 'String | Undefined');

		this.sendDataAs = typeof data === 'object' && !sendAs && !Buffer.isBuffer(data)
      ? 'json'
      : (sendAs ? sendAs.toLowerCase() : 'buffer');

		this.data = this.sendDataAs === 'form'
      ? qs.stringify(data)
      : (this.sendDataAs === 'json' ? JSON.stringify(data) : data);

		return this;
	}

  // oggetto solo su a1, o key/value con a1 e a2
	// set this.reqHeaders
	header (a1, a2) {
		checkParamOrThrow(a1, 'a1', 'Object | String');
		checkParamOrThrow(a2, 'a2', 'String | Undefined');

		if (typeof a1 === 'object') {
			Object.keys(a1).forEach((headerName) => {
				this.reqHeaders[headerName.toLowerCase()] = a1[headerName];
			});
		}
		else this.reqHeaders[a1.toLowerCase()] = a2;

		return this;
	}

	// set this.timeoutTime
	timeout (timeout) {
		checkParamOrThrow(timeout, 'timeout', 'Number');

		this.timeoutTime = timeout;

		return this;
	}

	// add an option (key/value) to this.coreOptions
	option (name, value) {
		checkParamOrThrow(name, 'name', 'Object | String');
		checkParamOrThrow(value, 'value', '*');

		this.coreOptions[name] = value;

		return this;
	}

	// set this.streamEnabled to true
	stream () {
		this.streamEnabled = true;

		return this;
	}

	// set ...
	compress () {
		this.compressionEnabled = true;

		if (!this.reqHeaders['accept-encoding'])
			this.reqHeaders['accept-encoding'] = supportedCompressions.join(', ');

		return this;
	}

	// send method
	send () {
		return new Promise((resolve, reject) => {
			// set some more headers
			// if there is data, it's a POST, set content-type and content-length accordingly if necessary
			if (this.data) {
				if (!this.reqHeaders.hasOwnProperty('content-type')) {
					if (this.sendDataAs === 'json') {
						this.reqHeaders['content-type'] = 'application/json';
					}
					else if (this.sendDataAs === 'form') {
						this.reqHeaders['content-type'] = 'application/x-www-form-urlencoded';
					}
				}

				if (!this.reqHeaders.hasOwnProperty('content-length')) {
					this.reqHeaders['content-length'] = Buffer.byteLength(this.data);
				}
			}

			// create option obj adding the following to coreOptions (that by default is empty, but option method can add to it)
			// "options" will be the option obj to be passed to http.request(opt, resHandler)
			const options = Object.assign({
				'protocol': this.url.protocol,
				'host': this.url.hostname,
				'port': this.url.port,
				'path': this.url.pathname + this.url.search,
				'method': this.method,
				'headers': this.reqHeaders
			}, this.coreOptions);

			let req;

			// response handler for http.request
			const resHandler = (res) => {
				let readableStream = res;

				// Handle compression
				if (this.compressionEnabled) {
					if (res.headers['content-encoding'] === 'gzip') {
						readableStream = res.pipe(zlib.createGunzip());
					}
					else if (res.headers['content-encoding'] === 'deflate') {
						readableStream = res.pipe(zlib.createInflate());
					}
				}

				let response;

				if (this.streamEnabled) {
					resolve(readableStream);
				}
				else {
					response = new Response(res);

					readableStream.on('error', (err) => {
						reject(err);
					})

					readableStream.on('data', (chunk) => {
						response._addChunk(chunk);
					})

					readableStream.on('end', () => {
						resolve(response);
					})
				}
			}

			//
			if (this.url.protocol === 'http:') {
				req = http.request(options, resHandler);
			}
			else if (this.url.protocol === 'https:') {
				req = https.request(options, resHandler);
			}
			else throw new Error('Bad URL protocol: ' + this.url.protocol);

			if (this.timeoutTime) {
				req.setTimeout(this.timeoutTime, () => {
					req.abort();

					if (!this.streamEnabled) {
						reject(new Error('Timeout reached'));
					}
				})
			}

			req.on('error', (err) => {
				reject(err);
			})

			if (this.data) req.write(this.data);

			req.end();
		})
	}
}

module.exports = Request;
