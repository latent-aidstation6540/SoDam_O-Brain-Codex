import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(repoRoot, 'app');
const pluginRoot = join(repoRoot, 'plugins', 'o-brain');
const targetRoot = join(pluginRoot, 'app');
const expectedTarget = resolve(repoRoot, 'plugins', 'o-brain', 'app');
const entries = ['src', 'web', 'package.json', 'package-lock.json', '.env.local.example'];

if (resolve(targetRoot) !== expectedTarget || !expectedTarget.startsWith(resolve(repoRoot) + sep)) {
  throw new Error(`Unsafe package target: ${targetRoot}`);
}
if (!existsSync(join(repoRoot, '.git')) || !existsSync(sourceRoot) || !existsSync(pluginRoot)) {
  throw new Error('Run this script from the O-Brain Codex repository checkout.');
}

rmSync(targetRoot, { recursive: true, force: true });
mkdirSync(targetRoot, { recursive: true });
for (const entry of entries) {
  const source = join(sourceRoot, entry);
  if (!existsSync(source)) throw new Error(`Missing source entry: ${relative(repoRoot, source)}`);
  cpSync(source, join(targetRoot, entry), { recursive: true, force: true });
}
console.log(`[package-sync] copied ${entries.length} tracked entries to ${relative(repoRoot, targetRoot)}`);
