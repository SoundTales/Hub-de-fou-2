#!/usr/bin/env node
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const port = Number(process.env.PORT ?? 5173);
const root = path.resolve(process.cwd(), process.argv[2] ?? 'src');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sanitizePath(requestPath) {
  const pathname = decodeURIComponent(requestPath.split('?')[0]);
  const normalized = path.normalize(pathname).replace(/^\/+/, '');
  return path.join(root, normalized);
}

async function resolveFile(requestPath) {
  let target = sanitizePath(requestPath);
  if (!target.startsWith(root)) {
    const error = new Error('Forbidden');
    error.code = 'EACCES';
    throw error;
  }

  try {
    const fileStat = await stat(target);
    if (fileStat.isDirectory()) {
      target = path.join(target, 'index.html');
      await stat(target);
    }
    return target;
  } catch (error) {
    if (error.code === 'ENOENT') {
      const fallback = path.join(root, 'index.html');
      await stat(fallback);
      return fallback;
    }
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = await resolveFile(req.url ?? '/');
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    const status = error.code === 'ENOENT' ? 404 : error.code === 'EACCES' ? 403 : 500;
    const message =
      status === 404 ? 'Not Found' : status === 403 ? 'Forbidden' : 'Server Error';
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${message}: ${error.message}`);
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port} (serving ${root})`);
});
