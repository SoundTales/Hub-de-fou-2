#!/usr/bin/env node
import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

codex/create-react-front-to-replicate-image-3eehxz
const root = process.cwd();

const cwd = process.cwd();
main
const argBase = process.argv[2];

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

codex/create-react-front-to-replicate-image-3eehxz
const detectedBase = (await pathExists(path.join(root, 'src', 'index.html'))) ? 'src' : '.';
const baseDir = path.resolve(root, argBase ?? detectedBase);
const distDir = path.resolve(root, 'dist');

// Base: ./src si index.html existe, sinon racine. Override possible via argv[2].
const detectedBase = (await pathExists(path.join(cwd, 'src', 'index.html'))) ? 'src' : '.';
const baseDir = path.resolve(cwd, argBase ?? detectedBase);
const distDir = path.resolve(cwd, 'dist');

main
const assets = ['index.html', 'styles.css'];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all(
  assets.map(async (file) => {
    const source = path.join(baseDir, file);
    const destination = path.join(distDir, file);
    await cp(source, destination);
  }),
);

codex/create-react-front-to-replicate-image-3eehxz
const relativeBase = path.relative(root, baseDir) || '.';
console.log(`Build completed from \"${relativeBase}\" -> dist (${assets.length} assets copied).`);

const relativeBase = path.relative(cwd, baseDir) || '.';
const relativeDist = path.relative(cwd, distDir) || 'dist';
console.log(`Build completed from "${relativeBase}" -> ${relativeDist}/ (${assets.length} assets copied).`);
main
