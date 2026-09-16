import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const tempRoot = join(here, '..', 'data');
mkdirSync(tempRoot, { recursive: true });
const temp = mkdtempSync(join(tempRoot, '_server-selftest-'));
const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const value = probe.address().port; probe.close(() => resolve(value)); });
});
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [join(here, 'server.mjs')], {
  cwd: join(here, '..'), env: { ...process.env, OBRAIN_PORT: String(port), OBRAIN_DATA_DIR: join(temp, 'data') }, stdio: ['ignore', 'pipe', 'pipe']
});
let logs = '';
child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
child.stdout.on('data', value => { logs += value; }); child.stderr.on('data', value => { logs += value; });

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try { const response = await fetch(base); if (response.ok) return response.text(); } catch {}
    if (child.exitCode != null) throw new Error(`server exited ${child.exitCode}: ${logs.slice(-1000)}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`server timeout: ${logs.slice(-1000)}`);
}

try {
  const html = await waitForServer();
  const token = html.match(/window\.__OBT__\s*=\s*'([a-f0-9]{32})'/)?.[1];
  assert.ok(token, 'HTML에 API 토큰이 주입되어야 함');
  const headers = { 'x-obrain-token': token };
  assert.equal((await fetch(`${base}/api/health`)).status, 403);
  assert.equal((await fetch(base, { headers: { Origin: 'https://evil.example' } })).status, 403);
  const health = await fetch(`${base}/api/health`, { headers });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  assert.equal((await fetch(`${base}/api/memory/not-a-number`, { headers })).status, 400);
  assert.equal((await fetch(`${base}/api/memory`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: '{}' })).status, 400);
  const malformed = await fetch(`${base}/api/memory`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: '{bad' });
  assert.equal(malformed.status, 400);
  const malformedBody = await malformed.text();
  assert.doesNotMatch(malformedBody, /node_modules|[A-Za-z]:\\/);

  const createdResponse = await fetch(`${base}/api/memory`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ content: '서버 CRUD 통합 테스트 기억', type: '지식', importance: 3 }) });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  assert.ok(created.id > 0);
  assert.equal((await fetch(`${base}/api/memory/${created.id}`, { headers })).status, 200);
  const patched = await fetch(`${base}/api/memory/${created.id}`, { method: 'PATCH', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ importance: 5 }) });
  assert.equal(patched.status, 200);
  const listing = await fetch(`${base}/api/memories?limit=9999&offset=-10`, { headers });
  assert.equal(listing.status, 200);
  assert.ok(Array.isArray(await listing.json()));
  assert.equal((await fetch(`${base}/api/memory/${created.id}`, { method: 'DELETE', headers })).status, 200);
  assert.equal((await fetch(`${base}/api/memory/${created.id}`, { headers })).status, 404);
  console.log('✅ HTTP auth/CORS, invalid input, malformed JSON, memory CRUD, boundary pagination');
} finally {
  child.kill();
  await new Promise(resolve => child.once('close', resolve)).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 750));
  try { rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); }
  catch (error) { console.warn('[selftest] 임시 폴더 정리 보류:', error.code); }
}
