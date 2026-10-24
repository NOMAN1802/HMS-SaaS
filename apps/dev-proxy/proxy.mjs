// Development proxy: one local origin for both web apps, the way nginx joins them on
// healthcare.bytespate.com (P-043, P-044 as revised 2026-10-24). `pnpm dev` starts it with the
// apps. http://localhost:3000/staff goes to the staff app (apps/web, port 3100, basePath /staff)
// and everything else to the public site (apps/site, port 3200). Websocket upgrades (hot reload)
// follow the same rule. Each app still answers on its own port too. Development only: it is never
// built or deployed. Implements: T-WEB-18.
import http from 'node:http';
import net from 'node:net';

const PORT = 3000;
const SITE_PORT = 3200;
const STAFF_PORT = 3100;

/** Same rule as nginx: `location /staff` to the staff app, `location /` to the site. */
function upstreamPort(url = '/') {
  const path = url.split('?')[0];
  return path === '/staff' || path.startsWith('/staff/') ? STAFF_PORT : SITE_PORT;
}

function forwardedHeaders(request) {
  return {
    ...request.headers,
    'x-forwarded-host': request.headers.host ?? `localhost:${PORT}`,
    'x-forwarded-proto': 'http',
  };
}

const server = http.createServer((request, response) => {
  const port = upstreamPort(request.url);
  const upstream = http.request(
    {
      host: '127.0.0.1',
      port,
      method: request.method,
      path: request.url,
      headers: forwardedHeaders(request),
    },
    (reply) => {
      response.writeHead(reply.statusCode ?? 502, reply.headers);
      reply.pipe(response);
    },
  );
  upstream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    }
    response.end(`Nothing answers on port ${port} yet. Is "pnpm dev" still starting?\n`);
  });
  request.pipe(upstream);
});

server.on('upgrade', (request, socket, head) => {
  const upstream = net.connect(upstreamPort(request.url), '127.0.0.1', () => {
    const lines = [`${request.method} ${request.url} HTTP/${request.httpVersion}`];
    for (let index = 0; index < request.rawHeaders.length; index += 2) {
      lines.push(`${request.rawHeaders[index]}: ${request.rawHeaders[index + 1]}`);
    }
    upstream.write(`${lines.join('\r\n')}\r\n\r\n`);
    upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

server.listen(PORT, () => {
  console.log(`Site:  http://localhost:${PORT}/bn`);
  console.log(`Staff: http://localhost:${PORT}/staff`);
});
