/* Marso Studio admin server (local only, no dependencies).
   Run:  node admin/server.js        (or: npm run admin)     then open http://localhost:8766/admin/
   It serves the site and a small JSON API that reads/writes profile.json. Every save validates against
   admin/profile.schema.json and keeps a timestamped backup in admin/.backups/ (last 20). */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8766;
const HOST = '127.0.0.1';
const PROFILE = path.join(ROOT, 'profile.json');
const BACKUPS = path.join(__dirname, '.backups');
const KEEP_BACKUPS = 20;
const SCHEMA = JSON.parse(fs.readFileSync(path.join(__dirname, 'profile.schema.json'), 'utf8'));
const { validate } = require('./validate.js');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};

function send(res, status, body, headers) {
  const isObj = body !== null && typeof body === 'object' && !Buffer.isBuffer(body);
  const payload = isObj ? JSON.stringify(body) : body;
  res.writeHead(status, Object.assign({
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
  }, headers));
  res.end(payload);
}

function versionOf(file) { return String(fs.statSync(file).mtimeMs); }

function readProfile() {
  return { data: JSON.parse(fs.readFileSync(PROFILE, 'utf8')), version: versionOf(PROFILE) };
}

// Fixed-width name (date-time-ms-counter): sorting the names alphabetically is sorting them chronologically.
const BACKUP_NAME = /^profile-\d{8}-\d{6}-\d{3}-\d{2}\.json$/;
function backupName(counter) {
  const d = new Date(), p = (n, w) => String(n).padStart(w || 2, '0');
  return 'profile-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds())
    + '-' + p(d.getMilliseconds(), 3) + '-' + p(counter) + '.json';
}

function backupCurrent() {
  fs.mkdirSync(BACKUPS, { recursive: true });
  let n = 0, name = backupName(n);
  while (fs.existsSync(path.join(BACKUPS, name)) && n < 99) name = backupName(++n);
  fs.copyFileSync(PROFILE, path.join(BACKUPS, name));
  const all = listBackups();
  all.slice(KEEP_BACKUPS).forEach((b) => fs.unlinkSync(path.join(BACKUPS, b.name)));
  return name;
}

function listBackups() {
  if (!fs.existsSync(BACKUPS)) return [];
  return fs.readdirSync(BACKUPS).filter((n) => BACKUP_NAME.test(n)).map((name) => {
    const st = fs.statSync(path.join(BACKUPS, name));
    return { name, size: st.size, createdAt: st.mtime.toISOString() };
  }).sort((a, b) => (a.name < b.name ? 1 : -1));
}

// atomic write: temp file in the same folder, then rename over the original
function writeProfile(data) {
  const tmp = PROFILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, PROFILE);
  return versionOf(PROFILE);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 1024 * 1024) { reject(new Error('Cuerpo demasiado grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(new Error('JSON inválido')); } });
    req.on('error', reject);
  });
}

// Only this machine, only this origin, and mutating requests must carry a custom header (forces a CORS preflight, which we never grant).
function guard(req, res) {
  const host = (req.headers.host || '').toLowerCase();
  if (host !== 'localhost:' + PORT && host !== '127.0.0.1:' + PORT) { send(res, 403, { error: 'Host no permitido' }); return false; }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.origin;
    if (origin && origin !== 'http://' + host) { send(res, 403, { error: 'Origen no permitido' }); return false; }
    if (req.headers['x-requested-with'] !== 'marso-admin') { send(res, 403, { error: 'Falta la cabecera de administración' }); return false; }
  }
  return true;
}

async function api(req, res, pathname) {
  try {
    if (pathname === '/api/profile' && req.method === 'GET') return send(res, 200, readProfile());

    if (pathname === '/api/profile' && req.method === 'PUT') {
      const body = await readBody(req);
      if (String(body.version) !== versionOf(PROFILE)) return send(res, 409, { error: 'conflict', message: 'profile.json cambió en el disco desde que lo abriste. Descarta los cambios para recargar.' });
      const result = validate(SCHEMA, body.data);
      if (!result.ok) return send(res, 400, { error: 'validation', errors: result.errors });
      const backup = backupCurrent();
      const version = writeProfile(result.data);
      return send(res, 200, { ok: true, version, data: result.data, backup });
    }

    if (pathname === '/api/backups' && req.method === 'GET') return send(res, 200, { backups: listBackups() });

    if (pathname === '/api/restore' && req.method === 'POST') {
      const body = await readBody(req);
      if (!BACKUP_NAME.test(String(body.name))) return send(res, 400, { error: 'Nombre de respaldo inválido' });
      const file = path.join(BACKUPS, body.name);
      if (!fs.existsSync(file)) return send(res, 404, { error: 'Respaldo no encontrado' });
      if (String(body.version) !== versionOf(PROFILE)) return send(res, 409, { error: 'conflict', message: 'profile.json cambió en el disco. Recarga antes de restaurar.' });
      const result = validate(SCHEMA, JSON.parse(fs.readFileSync(file, 'utf8')));
      if (!result.ok) return send(res, 400, { error: 'validation', errors: result.errors });
      const backup = backupCurrent();
      const version = writeProfile(result.data);
      return send(res, 200, { ok: true, version, data: result.data, backup });
    }

    return send(res, 404, { error: 'Ruta no encontrada' });
  } catch (e) {
    return send(res, 500, { error: e.message });
  }
}

function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch (e) { return send(res, 400, 'Solicitud inválida'); }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(ROOT, '.' + rel);
  const inside = path.relative(ROOT, file);
  const parts = inside.split(path.sep);
  const blocked = inside.startsWith('..') || path.isAbsolute(inside) || parts.some((p) => p.startsWith('.') || p === 'node_modules')
    || inside === path.join('admin', 'server.js') || /\.tmp$/.test(inside);
  if (blocked) return send(res, 403, 'Acceso denegado');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'No encontrado');
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : st.size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : st.size - 1;
      end = Math.min(end, st.size - 1);
      if (start > end || start < 0) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
      res.writeHead(206, Object.assign(headers, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + st.size, 'Content-Length': end - start + 1 }));
      return req.method === 'HEAD' ? res.end() : fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, Object.assign(headers, { 'Content-Length': st.size }));
    return req.method === 'HEAD' ? res.end() : fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (!guard(req, res)) return;
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname.startsWith('/api/')) return api(req, res, pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método no permitido');
  return serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log('\nMarso Studio · panel de administración');
  console.log('  Panel:  http://localhost:' + PORT + '/admin/');
  console.log('  Sitio:  http://localhost:' + PORT + '/');
  console.log('  Datos:  ' + PROFILE);
  console.log('  Solo accesible desde este computador. Ctrl+C para detener.\n');
});
server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? 'El puerto ' + PORT + ' ya está en uso. Prueba con: PORT=8777 node admin/server.js' : e.message);
  process.exit(1);
});
