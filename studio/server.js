const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 4010);
const ROOT = __dirname;
const WEBSITE_ROOT = path.join(ROOT, '..', 'website');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'config.default.json');
const SESSION_COOKIE = 'rydex_studio_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ADMIN_ID = process.env.RYDEX_STUDIO_ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.RYDEX_STUDIO_ADMIN_PASSWORD || 'rydexstudio';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const sessions = new Map();

function ensureConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(DEFAULT_CONFIG_PATH, CONFIG_PATH);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildHeaders(contentType, extraHeaders = {}) {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  };
}

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8', extraHeaders = {}) {
  res.writeHead(statusCode, buildHeaders(contentType, extraHeaders));
  res.end(body);
}

function serveFile(reqPath, res) {
  const requested = reqPath === '/' ? '/index.html' : reqPath;
  const safePath = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, buffer, MIME_TYPES[ext] || 'application/octet-stream');
  });
}

function serveWebsiteFile(reqPath, res) {
  const trimmedPath = reqPath.replace(/^\/website\/?/, '/');
  const requested = trimmedPath === '/' ? '/index.html' : trimmedPath;
  const safePath = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(WEBSITE_ROOT, safePath);

  if (!filePath.startsWith(WEBSITE_ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, buffer, MIME_TYPES[ext] || 'application/octet-stream');
  });
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').reduce((acc, item) => {
    const [rawKey, ...rawValue] = item.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSession(adminId) {
  const sessionId = crypto.randomBytes(24).toString('hex');
  sessions.set(sessionId, {
    adminId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return sessionId;
}

function destroySession(sessionId) {
  if (!sessionId) return;
  sessions.delete(sessionId);
}

function getSession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return { ...session, sessionId };
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    send(res, 401, JSON.stringify({ message: 'Authentication required' }), MIME_TYPES['.json']);
    return null;
  }
  return session;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let payload = '';
    req.on('data', (chunk) => {
      payload += chunk;
      if (payload.length > 2_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(payload || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function validateConfigShape(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Config must be a JSON object');
  }

  if (!value.shared || typeof value.shared !== 'object') {
    throw new Error('Config is missing shared data');
  }

  if (!value.appMode || typeof value.appMode !== 'object') {
    throw new Error('Config is missing App Mode data');
  }

  if (!value.websiteMode || typeof value.websiteMode !== 'object') {
    throw new Error('Config is missing Website Mode data');
  }

  const requiredArrays = [
    ['appMode.tabs', value.appMode.tabs],
    ['appMode.suggestions', value.appMode.suggestions],
    ['appMode.banners', value.appMode.banners],
    ['websiteMode.navLinks', value.websiteMode.navLinks]
  ];

  requiredArrays.forEach(([label, item]) => {
    if (!Array.isArray(item)) {
      throw new Error(`${label} must be an array`);
    }
  });
}

ensureConfigFile();

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  if (requestUrl.pathname === '/api/session' && req.method === 'GET') {
    const session = getSession(req);
    if (!session) {
      send(res, 200, JSON.stringify({ authenticated: false }), MIME_TYPES['.json']);
      return;
    }
    send(
      res,
      200,
      JSON.stringify({ authenticated: true, user: { adminId: session.adminId } }),
      MIME_TYPES['.json']
    );
    return;
  }

  if (requestUrl.pathname === '/api/health' && req.method === 'GET') {
    send(res, 200, JSON.stringify({ status: 'ok', service: 'rydex-studio' }), MIME_TYPES['.json']);
    return;
  }

  if (requestUrl.pathname === '/website' || requestUrl.pathname.startsWith('/website/')) {
    serveWebsiteFile(requestUrl.pathname, res);
    return;
  }

  if (requestUrl.pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const parsed = await parseBody(req);
      const adminId = String(parsed.adminId || '').trim();
      const password = String(parsed.password || '');

      if (!adminId || !password) {
        send(res, 400, JSON.stringify({ message: 'Admin ID and password are required' }), MIME_TYPES['.json']);
        return;
      }

      if (!safeCompare(adminId, ADMIN_ID) || !safeCompare(password, ADMIN_PASSWORD)) {
        send(res, 401, JSON.stringify({ message: 'Invalid admin credentials' }), MIME_TYPES['.json']);
        return;
      }

      const sessionId = createSession(adminId);
      send(
        res,
        200,
        JSON.stringify({ authenticated: true, user: { adminId } }),
        MIME_TYPES['.json'],
        {
          'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(
            SESSION_TTL_MS / 1000
          )}`
        }
      );
    } catch (error) {
      send(res, 400, JSON.stringify({ message: error.message || 'Invalid request' }), MIME_TYPES['.json']);
    }
    return;
  }

  if (requestUrl.pathname === '/api/auth/logout' && req.method === 'POST') {
    const session = getSession(req);
    if (session) {
      destroySession(session.sessionId);
    }
    send(
      res,
      200,
      JSON.stringify({ authenticated: false }),
      MIME_TYPES['.json'],
      {
        'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
      }
    );
    return;
  }

  if (requestUrl.pathname === '/api/config' && req.method === 'GET') {
    if (!requireSession(req, res)) return;
    try {
      ensureConfigFile();
      send(res, 200, JSON.stringify(readJson(CONFIG_PATH), null, 2), MIME_TYPES['.json']);
    } catch (error) {
      send(res, 500, JSON.stringify({ message: error.message || 'Failed to read config' }), MIME_TYPES['.json']);
    }
    return;
  }

  if (requestUrl.pathname === '/api/default-config' && req.method === 'GET') {
    if (!requireSession(req, res)) return;
    try {
      send(res, 200, JSON.stringify(readJson(DEFAULT_CONFIG_PATH), null, 2), MIME_TYPES['.json']);
    } catch (error) {
      send(res, 500, JSON.stringify({ message: error.message || 'Failed to read default config' }), MIME_TYPES['.json']);
    }
    return;
  }

  if (requestUrl.pathname === '/api/config' && req.method === 'PUT') {
    if (!requireSession(req, res)) return;
    try {
      const parsed = await parseBody(req);
      validateConfigShape(parsed);
      fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(parsed, null, 2)}\n`);
      send(res, 200, JSON.stringify({ status: 'ok' }), MIME_TYPES['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ message: error.message || 'Invalid JSON' }), MIME_TYPES['.json']);
    }
    return;
  }

  serveFile(requestUrl.pathname, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Rydex Studio running on http://127.0.0.1:${PORT}`);
});
