import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(repoRoot, 'app');
const packageRoot = join(repoRoot, 'plugins', 'o-brain');
const targetRoot = join(packageRoot, 'app');
const entries = ['src', 'web', 'package.json', 'package-lock.json', '.env.local.example'];
const bannedDirs = new Set(['node_modules', 'data', '.git', '.cache', 'coverage', 'dist']);
const bannedNames = new Set(['.env', '.env.local']);
const bannedExtensions = new Set(['.db', '.sqlite', '.sqlite3', '.pem', '.key', '.p12', '.pfx', '.log']);

function filesUnder(root) {
  const result = [];
  function visit(current) {
    for (const item of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, item.name);
      if (item.isDirectory()) visit(full);
      else if (item.isFile()) result.push(full);
    }
  }
  if (existsSync(root)) visit(root);
  return result;
}
function hash(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
function selectedFiles(root) {
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry);
    if (!existsSync(path)) throw new Error(`Missing package source: ${relative(repoRoot, path)}`);
    if (statSync(path).isDirectory()) files.push(...filesUnder(path)); else files.push(path);
  }
  return files.map(path => relative(root, path).replaceAll('\\', '/')).sort();
}

const problems = [];
const sourceFiles = selectedFiles(sourceRoot);
const targetFiles = selectedFiles(targetRoot);
for (const name of sourceFiles.filter(name => !targetFiles.includes(name))) problems.push(`missing packaged file: ${name}`);
for (const name of targetFiles.filter(name => !sourceFiles.includes(name))) problems.push(`unexpected packaged file: ${name}`);
for (const name of sourceFiles.filter(name => targetFiles.includes(name))) {
  if (hash(join(sourceRoot, name)) !== hash(join(targetRoot, name))) problems.push(`content differs: ${name}`);
}
let bytes = 0;
function inspect(current) {
  for (const item of readdirSync(current, { withFileTypes: true })) {
    const full = join(current, item.name);
    const shown = relative(repoRoot, full).replaceAll('\\', '/');
    if (item.isDirectory()) {
      if (bannedDirs.has(item.name)) problems.push(`banned directory: ${shown}`);
      else inspect(full);
    } else if (item.isFile()) {
      bytes += statSync(full).size;
      if (bannedNames.has(item.name) || bannedExtensions.has(extname(item.name).toLowerCase())) problems.push(`banned file: ${shown}`);
    }
  }
}
inspect(packageRoot);
if (bytes > 10 * 1024 * 1024) problems.push(`package too large before setup: ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
if (problems.length) {
  console.error('[package-check] FAILED');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(`[package-check] PASS: ${targetFiles.length} app files match; package ${(bytes / 1024 / 1024).toFixed(2)} MiB; no banned local data`);
