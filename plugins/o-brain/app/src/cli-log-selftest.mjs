import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const pluginRoot = existsSync(join(root, 'hooks')) ? root : join(root, 'plugins', 'o-brain');
const moduleUrl = pathToFileURL(join(pluginRoot, 'scripts', 'server-log.mjs')).href;
const { openServerLog, readRecentServerIssues } = await import(moduleUrl);
const temp = mkdtempSync(join(tmpdir(), 'obrain-cli-log-'));
try {
  const logDir = join(temp, 'logs');
  const logFile = join(logDir, 'server.log');
  const first = openServerLog(temp, { maxBytes: 32, keep: 2 });
  first.close();
  writeFileSync(logFile, 'x'.repeat(64));
  const rotated = openServerLog(temp, { maxBytes: 32, keep: 2 });
  rotated.close();
  assert.equal(existsSync(`${logFile}.1`), true);
  writeFileSync(logFile, '[server:error] code=EADDRINUSE token=top-secret sk-abcdefghijklmnop\n');
  const issues = readRecentServerIssues(logFile);
  assert.equal(issues.length, 1);
  assert.doesNotMatch(issues[0], /top-secret|sk-abcdefghijklmnop/);
  assert.match(issues[0], /REDACTED/);
  assert.equal(readFileSync(`${logFile}.1`, 'utf8').length, 64);
  console.log('✅ server log rotation, issue detection, secret redaction');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
