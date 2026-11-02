import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMaxInitData } from './src/max-auth.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(root, 'dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
const anonymous = () => ({ authenticated: false, identityVerified: false, identity: null, foxfordLinked: false });

export function createAppServer({ botToken = process.env.MAX_BOT_TOKEN, cookieSecure = process.env.COOKIE_SECURE === 'true' } = {}) {
  const sessions = new Map();
  const cookieName = 'myboxfoxel_session';
  const cookie = (value, maxAge) => `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cookieSecure ? '; Secure' : ''}`;
  const getSessionId = req => (req.headers.cookie ?? '').split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  function json(res, status, value, headers = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(value));
  }
  async function body(req) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 65536) { const e = new Error('body_too_large'); e.status = 413; throw e; }
      chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { const e = new Error('invalid_json'); e.status = 400; throw e; }
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://st.max.ru; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://st.max.ru; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/api/health' && req.method === 'GET') {
        return json(res, 200, { ok: true, mode: 'demo', maxConfigured: Boolean(botToken), foxfordConnected: false });
      }
      if (pathname === '/api/max/session') {
        const now = Math.floor(Date.now() / 1000);
        for (const [id, session] of sessions) if (session.expiresAt <= now) sessions.delete(id);
        if (req.method === 'GET') {
          const session = sessions.get(getSessionId(req));
          return json(res, 200, session ? { authenticated: true, identityVerified: true, identity: session.identity, foxfordLinked: false } : anonymous());
        }
        // A browser may only change its session through this same-origin application.
        if (req.headers.origin) {
          let origin;
          try { origin = new URL(req.headers.origin); } catch { return json(res, 403, { error: 'origin_not_allowed' }); }
          if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== req.headers.host) return json(res, 403, { error: 'origin_not_allowed' });
        }
        if (req.method === 'DELETE') {
          sessions.delete(getSessionId(req));
          return json(res, 200, anonymous(), { 'Set-Cookie': cookie('', 0) });
        }
        if (req.method === 'POST') {
          if (!botToken) return json(res, 503, { error: 'max_not_configured' });
          if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'json_required' });
          const input = await body(req);
          let validation;
          try { validation = validateMaxInitData(input?.initData, botToken); }
          catch { return json(res, 401, { error: 'invalid_init_data' }); }
          if (sessions.size >= 1000) return json(res, 503, { error: 'session_capacity' });
          const id = randomBytes(32).toString('hex');
          sessions.delete(getSessionId(req));
          sessions.set(id, validation);
          return json(res, 200, { authenticated: true, identityVerified: true, identity: validation.identity, foxfordLinked: false }, {
            'Set-Cookie': cookie(id, Math.max(0, validation.expiresAt - now)),
          });
        }
        return json(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET, POST, DELETE' });
      }
      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'not_found' });
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'method_not_allowed' });
      let decoded;
      try { decoded = decodeURIComponent(pathname); } catch { return json(res, 400, { error: 'invalid_path' }); }
      if (decoded.includes('\\') || decoded.includes('\0')) return json(res, 400, { error: 'invalid_path' });
      let file = path.resolve(staticRoot, `.${decoded}`);
      if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) return json(res, 403, { error: 'forbidden' });
      try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); }
      catch { if (!path.extname(decoded)) file = path.join(staticRoot, 'index.html'); }
      let content;
      try { content = await readFile(file); }
      catch { return json(res, 404, { error: 'not_found' }); }
      res.writeHead(200, { 'Content-Type': `${mime[path.extname(file)] ?? 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      json(res, error.status ?? 500, { error: error.status ? error.message : 'internal_error' });
    }
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  const host = process.env.HOST ?? '127.0.0.1';
  const server = createAppServer();
  server.listen(port, host, () => console.log(`MyBoxFoxel: http://${host}:${port} (demo)`));
  server.on('error', error => { console.error(`Cannot start server: ${error.message}`); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
