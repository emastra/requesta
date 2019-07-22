const rqsta = require('../index');

const url = 'https://hacker-news.firebaseio.com/v0/item/8863.json';
const r = rqsta(url);


describe('Request class', () => {
  describe('query method', () => {
    it('should throw if params dont pass checkParamOrThrow', () => {
      expect(() => r.query(1, 'pretty')).toThrow();
      expect(() => r.query(undefined, 'pretty')).toThrow();
      expect(() => r.query('print', 1)).toThrow();
      expect(() => r.query('print', null)).toThrow();
    });

    it('should add a query string with a single param', () => {
      const req = r.query('print', 'pretty');

      expect(req.url.href).toEqual(url + '?print=pretty');
    });

    it('should add a query string with multiple params', () => {
      const req = r.query({print: 'pretty', one: 'two'});

      expect(req.url.href).toContain('?print=pretty&print=pretty&one=two');
    });
  });

  describe('path method', () => {
    it('should add relative path to pathname', () => {
      const prevPath = r.url.pathname;
      const req = r.path('testpath');

      expect(req.url.pathname).toContain(prevPath + '/testpath');
    });
  });

  describe('body method', () => {

  });

  describe('header method', () => {

  });

  describe('timeout method', () => {

  });

  describe('option method', () => {

  });

  describe('stream method', () => {

  });

  describe('compress method', () => {

  });

  describe('send method', () => {
    // it('should return 200', async (done) => {
    //   const res = await r.send();
    //
    //   expect(res.statusCode).toBe(200);
    //
    //   done();
    // });
  });
});
