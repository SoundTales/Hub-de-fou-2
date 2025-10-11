#!/usr/bin/env node
import http from 'node:http';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const argRoot = process.argv[2];
const port = Number(process.env.PORT ?? 5173);

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

codex/create-react-front-to-replicate-image-3eehxz
// Auto-détection du dossier à servir : ./src si index.html existe, sinon .
main
const detectedRoot = (await pathExists(path.join(cwd, 'src', 'index.html'))) ? 'src' : '.';
const root = path.resolve(cwd, argRoot ?? detectedRoot);

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
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function normalizeRequestUrl(requestUrl = '/') {
  const [pathname] = requestUrl.split('?');
  return decodeURIComponent(pathname);
}

function buildFilePath(requestUrl) {
  const pathname = normalizeRequestUrl(requestUrl);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolved = path.resolve(root, relativePath);

codex/create-react-front-to-replicate-image-3eehxz
  const traversal = path.relative(root, resolved);
  if (traversal.startsWith('..') || path.isAbsolute(traversal)) {
    const error = new Error('Forbidden');
=======
  // Sécurité : pas de sortie du dossier servi
  const traversal = path.relative(root, resolved);
  if (traversal.startsWith('..') || path.isAbsolute(traversal)) {
    const error = new Error('Forbidden');
    // @ts-ignore
main
    error.code = 'EACCES';
    throw error;
  }

  return resolved;
}

async function resolveFile(requestUrl) {
  const candidate = buildFilePath(requestUrl);
  try {
    const stats = await stat(candidate);
    if (stats.isDirectory()) {
      const indexPath = path.join(candidate, 'index.html');
      await stat(indexPath);
      return indexPath;
    }
    return candidate;
  } catch (error) {
codex/create-react-front-to-replicate-image-3eehxz
    if (error.code === 'ENOENT') {
      const notFound = new Error(`File not found: ${requestUrl}`);
      notFound.code = 'ENOENT';
      throw notFound;
=======
    // Fallback SPA : renvoyer index.html si le fichier demandé n'existe pas
    if (error.code === 'ENOENT') {
      const fallback = path.join(root, 'index.html');
      await stat(fallback);
      return fallback;
main
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
codex/create-react-front-to-replicate-image-3eehxz
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
  const relativeRoot = path.relative(cwd, root) || '.';
  console.log(`Static server running at http://localhost:${port} (serving ${relativeRoot})`);
});
    res.writeHead(200, { 'Content-Type': contentType
main
