const UPSTREAM = 'https://auto-test.online';

async function proxyApi(req, res, endpoint) {
  const target = new URL(`/api/${endpoint}/`, UPSTREAM);
  const current = new URL(req.url, 'http://localhost');
  target.search = current.search;

  try {
    const upstreamResponse = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'test-auto-school-project/1.0'
      }
    });

    const body = await upstreamResponse.text();
    res.statusCode = upstreamResponse.status;
    res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ count: 0, next: null, previous: null, results: [] }));
  }
}

module.exports = { proxyApi };
