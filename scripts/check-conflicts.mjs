#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd(), process.argv[2] ?? '.');
const ignore = new Set(['node_modules', '.git', 'dist', '.vite']);
codex/create-react-front-to-replicate-image-3eehxz
const markerStart = '<'.repeat(7);
const markerMid = '='.repeat(7);
const markerEnd = '>'.repeat(7);
const conflictPattern = new RegExp(
  String.raw`(?:^|\n)(?:${markerStart} .+|${markerMid}|${markerEnd} .+)`,
);

const conflictPattern = /(?:^|\n)(?:<<<<<<< .+|=======|>>>>>>> .+)/;
main

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

const offenders = [];

for await (const filePath of walk(root)) {
  const content = await readFile(filePath, 'utf8');
  if (conflictPattern.test(content)) {
    offenders.push(path.relative(root, filePath));
  }
}

if (offenders.length > 0) {
  console.error('Conflict markers detected in:\n' + offenders.join('\n'));
  process.exitCode = 1;
} else {
  console.log('No conflict markers found.');
}
