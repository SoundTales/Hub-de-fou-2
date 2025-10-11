#!/usr/bin/env node
import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const argBase = process.argv[2];

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

// Base: ./src si index.html existe, sinon racine. Override possible via argv[2].
const detectedBase = (await pathExists(path.join(cwd, 'src', 'index.html'))) ? 'src' : '.';
const baseDir = path.resolve(cwd, argBase ?? detectedBase);
const distDir = path.resolve(cwd, 'dist');

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

const relativeBase = path.relative(cwd, baseDir) || '.';
const relativeDist = path.relative(cwd, distDir) || 'dist';
console.log(`Build completed from "${relativeBase}" -> ${relativeDist}/ (${assets.length} assets copied).`);
