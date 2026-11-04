import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const manifest = JSON.parse(await readFile(path.join(root, 'docs/source-manifest.json'), 'utf8'));
let server, origin;
before(async () => {
  server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, env: { ...process.env, PORT: '0', HOST: '0.0.0.0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  origin = await new Promise((resolve, reject) => {
    let text = '';
    const timeout = setTimeout(() => reject(new Error('Static server startup timed out')), 5000);
    server.once('error', reject);
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Static server exited: ${code}`)); });
    server.stdout.on('data', data => {
      text += data;
      const match = text.match(/0\.0\.0\.0:(\d+)/);
      if (match) { clearTimeout(timeout); resolve(`http://127.0.0.1:${match[1]}`); }
    });
  });
});
after(async () => { if (server && server.exitCode === null) { server.kill(); await once(server, 'exit'); } });

test('new Drive source, 123 imported files, 29 standalone website pages', async () => {
  assert.equal(manifest.drive_folder_id, '1ihxLPaNrBgaagDJ6_ZwBD6l8Wg4Iu-UK');
  assert.equal(manifest.files.length, 123);
  assert.equal(pages.length, 29);
  for (const old of ['nuxt.config.ts', 'app.vue', 'pages', 'components', 'data', 'public', '.output', '.nuxt']) {
    await assert.rejects(access(path.join(root, old)), `${old} must not remain in the active application`);
  }
});

test('every imported file remains present; unmodified assets match downloaded SHA-256', async () => {
  for (const entry of manifest.files) {
    const data = await readFile(path.join(root, entry.path));
    assert.ok(data.length > 0, entry.path);
    if (!/\.(html|css)$/.test(entry.path) && entry.path !== 'js/slider.js') {
      assert.equal(createHash('sha256').update(data).digest('hex'), entry.downloaded_sha256, entry.path);
    }
  }
});

for (const name of pages) {
  test(`${name}: HTTP 200, valid inline JS and local references`, async () => {
    const response = await fetch(`${origin}/${name}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const html = await response.text();
    assert.match(html, /<!DOCTYPE html/i);
    assert.doesNotMatch(html, /[0-9a-f]{24}-text\/javascript|src=["']\/cdn-cgi\//i);
    const uncommented = html.replace(/<!--[\s\S]*?-->/g, '');
    for (const script of uncommented.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=/.test(script[1])) assert.doesNotThrow(() => new vm.Script(script[2]), name);
    }
    for (const reference of uncommented.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const url = new URL(reference[1], `${origin}/${name}`);
      if (url.origin !== origin || !url.pathname || url.pathname === `/${name}`) continue;
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      assert.ok(file.startsWith(root), reference[1]);
      const info = await stat(file);
      assert.ok(info.isFile() || info.isDirectory(), reference[1]);
      assert.equal((await fetch(url, { method: 'HEAD' })).status, 200, reference[1]);
    }
  });
}

test('static server serves root, binary assets, source report and accepts preview Host', async () => {
  for (const url of ['/', '/images/logo.png', '/fonts/supermarket.woff', '/report/index.html']) {
    const response = await fetch(origin + url, { headers: { Host: '3000-sandbox.e2b.app' } });
    assert.equal(response.status, 200, url);
    assert.ok(Number(response.headers.get('content-length')) > 0);
  }
  assert.match((await fetch(origin + '/fonts/supermarket.woff')).headers.get('content-type'), /font\/woff/);
});

test('missing files are 404, not SPA fallbacks; repository files are not public', async () => {
  for (const url of ['/missing.html', '/.git/config', '/%2egit/config', '/.env', '/scripts/serve.mjs', '/package.json']) {
    assert.equal((await fetch(origin + url)).status, 404, url);
  }
  assert.equal((await fetch(origin + '/%ZZ')).status, 400);
});

test('server rejects submissions instead of pretending to send mail', async () => {
  const response = await fetch(origin + '/contactus.php', { method: 'POST', body: 'name=test' });
  assert.equal(response.status, 405);
  assert.match(await response.text(), /No form-processing backend/);
  const compatibility = await readFile(path.join(root, 'js/static-compat.js'), 'utf8');
  assert.match(compatibility, /preventDefault/);
  assert.match(compatibility, /has not been sent/);
});
