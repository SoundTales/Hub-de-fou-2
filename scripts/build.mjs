#!/usr/bin/env node
import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const argBase = process.argv[2];

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const detectedBase = (await pathExists(path.join(root, 'src', 'index.html'))) ? 'src' : '.';
const baseDir = path.resolve(root, argBase ?? detectedBase);
const distDir = path.resolve(root, 'dist');
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

const relativeBase = path.relative(root, baseDir) || '.';
console.log(`Build completed from \"${relativeBase}\" -> dist (${assets.length} assets copied).`);
