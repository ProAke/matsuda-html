import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.ico': 'image/x-icon' };
const server = http.createServer(async (req, res) => {
  const fail = (code, message) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(message); };
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return fail(405, 'This is a static website. No form-processing backend is configured.'); }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://static.local').pathname);
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(part => part.startsWith('.'))) return fail(404, 'Not found');
    let filename = path.resolve(root, '.' + pathname);
    if (!filename.startsWith(root + path.sep)) {
      if (filename !== root) return fail(404, 'Not found');
    }
    let info = await stat(filename);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }); return res.end(); }
      filename = path.join(filename, 'index.html'); info = await stat(filename);
    }
    const extension = path.extname(filename).split('#')[0].toLowerCase();
    if (!info.isFile() || !types[extension] || filename.startsWith(path.join(root, 'scripts') + path.sep)) return fail(404, 'Not found');
    res.writeHead(200, { 'Content-Type': types[extension], 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(filename).on('error', () => res.destroy()).pipe(res);
  } catch (error) { return fail(error instanceof URIError ? 400 : 404, 'Not found'); }
});
server.listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '0.0.0.0', () => {
  console.log(`Matsuda static HTML: http://${process.env.HOST ?? '0.0.0.0'}:${server.address().port}`);
});
