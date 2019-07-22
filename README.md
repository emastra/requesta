# requesta

> A very lightweight HTTP client for Node

[GitHub](https://github.com/emastra/) | [NPM](https://npmjs.com/)

### Install

```shell
npm i requesta
```

### Use requesta!

Require the library.

```js
const r = require('requesta');
```
Let's make a request in an async function.

```js
(async () => {
	const res = await r('https://hacker-news.firebaseio.com/v0/item/8863.json').send();

	console.log(await res.text());
})();
```
... more example to come...
