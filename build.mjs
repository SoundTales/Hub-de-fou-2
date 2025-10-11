#!/usr/bin/env node
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');
const assets = ['index.html', 'styles.css'];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all(
  assets.map(async (file) => {
    const source = path.join(sourceDir, file);
    const destination = path.join(distDir, file);
    await cp(source, destination);
  }),
);

console.log(`Copied ${assets.length} assets to ${path.relative(root, distDir)}/`);
