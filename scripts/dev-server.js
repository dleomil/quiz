const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function resolveFile(requestPath) {
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const normalized = path.normalize(safePath).replace(/^(\.\.[/\\])+/, '');
  return path.join(rootDir, normalized);
}

const server = http.createServer((req, res) => {
  const filePath = resolveFile(req.url.split('?')[0]);

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 500, 'Internal server error', {
          'Content-Type': 'text/plain; charset=utf-8',
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      });
    });
  });
});

server.listen(port, host, () => {
  console.log(`Quiz dev server running at http://${host}:${port}`);
});
