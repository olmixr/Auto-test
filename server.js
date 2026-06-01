const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIRROR_ROOT = path.join(ROOT, 'auto-test.online');
const UPSTREAM = 'https://auto-test.online';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function redirect(res, location) {
  send(res, 302, '', { Location: location });
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function resolveStaticFile(pathname) {
  const cleanPath = normalizePathname(pathname);

  if (cleanPath === '/') {
    return path.join(ROOT, 'index.html');
  }

  if (cleanPath === '/test' || cleanPath === '/test/' || cleanPath === '/test/index.html') {
    return path.join(MIRROR_ROOT, 'test', 'index4a2e.html');
  }

  if (cleanPath.startsWith('/test/')) {
    return path.join(MIRROR_ROOT, cleanPath);
  }

  if (cleanPath.startsWith('/static/') || cleanPath.startsWith('/cdn-cgi/')) {
    return path.join(MIRROR_ROOT, cleanPath);
  }

  if (cleanPath.startsWith('/auto-test.online/')) {
    return path.join(ROOT, cleanPath);
  }

  return path.join(ROOT, cleanPath);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function serveFile(req, res, filePath) {
  const safeRoots = [ROOT, MIRROR_ROOT];
  if (!safeRoots.some((root) => isInside(root, filePath))) {
    send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return true;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers = { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' };
  fs.createReadStream(filePath).pipe(res.writeHead(200, headers));
  return true;
}

async function proxyToUpstream(req, res, upstreamPath) {
  const target = new URL(upstreamPath, UPSTREAM);
  const current = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  target.search = current.search;

  try {
    const upstreamResponse = await fetch(target, {
      headers: {
        Accept: upstreamPath.startsWith('/api/') ? 'application/json' : '*/*',
        'User-Agent': 'test-auto-school-project/1.0'
      }
    });

    const headers = {
      'Cache-Control': upstreamPath.startsWith('/api/')
        ? 'no-store'
        : 'public, max-age=86400',
      'Content-Type': upstreamResponse.headers.get('content-type') || 'application/octet-stream'
    };

    res.writeHead(upstreamResponse.status, headers);
    const body = Buffer.from(await upstreamResponse.arrayBuffer());
    res.end(body);
  } catch (error) {
    if (upstreamPath.startsWith('/api/')) {
      send(res, 502, JSON.stringify({ count: 0, next: null, previous: null, results: [] }), {
        'Content-Type': 'application/json; charset=utf-8'
      });
      return;
    }

    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = normalizePathname(url.pathname);

  if (pathname === '/') {
    redirect(res, '/test/?country=md&language=ru');
    return;
  }

  if (pathname === '/api/questions' || pathname === '/api/questions/') {
    await proxyToUpstream(req, res, '/api/questions/');
    return;
  }

  if (pathname === '/api/subjects' || pathname === '/api/subjects/') {
    await proxyToUpstream(req, res, '/api/subjects/');
    return;
  }

  const filePath = resolveStaticFile(pathname);
  if (serveFile(req, res, filePath)) {
    return;
  }

  if (pathname.startsWith('/static/custom/img/md/') || pathname === '/static/custom/img/noimage.jpg') {
    await proxyToUpstream(req, res, pathname);
    return;
  }

  send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
});

server.listen(PORT, () => {
  console.log(`Auto test is running on http://localhost:${PORT}`);
});
