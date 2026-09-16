import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const pluginRoot = existsSync(join(root, 'hooks')) ? root : join(root, 'plugins', 'o-brain');
const tempRoot = join(root, 'app', 'data');
mkdirSync(tempRoot, { recursive: true });
const temp = mkdtempSync(join(tempRoot, '_hook-selftest-'));
const data = join(temp, 'data');
const project = join(temp, 'project');
mkdirSync(join(project, '.git'), { recursive: true });
const transcript = join(temp, 'rollout.jsonl');
writeFileSync(transcript, [
  { type: 'session_meta', payload: { id: 'hook-test' } },
  { type: 'turn_context', payload: { cwd: project } },
  { type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '이 프로젝트에서는 API 키 sk-test-secret-value 를 사용하기로 결정했다.' }] } },
  { type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: '확인했습니다.' }] } }
].map(JSON.stringify).join('\n'));

function runHook(file, payload) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(pluginRoot, 'hooks', file)], { cwd: pluginRoot, env: { ...process.env, OBRAIN_APP_ROOT: join(root, 'app'), OBRAIN_DATA_DIR: data }, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', value => { stdout += value; });
    child.stderr.on('data', value => { stderr += value; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${file} exited ${code}: ${stderr}`)));
    child.stdin.end(JSON.stringify(payload));
  });
}

try {
  const extracted = await runHook('memory-extract-hook.mjs', { transcript_path: transcript, cwd: project, hook_event_name: 'SessionEnd' });
  assert.match(extracted.stderr, /저장 1건/);
  assert.doesNotMatch(extracted.stderr, /sk-test-secret-value/);
  process.env.OBRAIN_DATA_DIR = data;
  const { openDb } = await import('./db.mjs');
  const db = openDb();
  const session = db.prepare('SELECT project, tool FROM session ORDER BY id DESC LIMIT 1').get();
  const memory = db.prepare('SELECT content FROM memory ORDER BY id DESC LIMIT 1').get();
  assert.equal(session.tool, 'codex');
  assert.equal(session.project, project);
  assert.match(memory.content, /\[REDACTED(?::[^\]]+)?\]/);
  assert.doesNotMatch(memory.content, /sk-test-secret-value/);
  db.close();

  const injected = await runHook('memory-inject-hook.mjs', { transcript_path: transcript, cwd: project, hook_event_name: 'SessionStart' });
  const output = JSON.parse(injected.stdout);
  assert.equal(output.continue, true);
  assert.equal(output.hookSpecificOutput?.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput?.additionalContext || '', /O-Brain/);
  console.log('✅ SessionEnd capture, Codex tool/project, secret redaction, SessionStart injection');
} finally {
  await new Promise(resolve => setTimeout(resolve, 750));
  try { rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); }
  catch (error) { console.warn('[selftest] 임시 폴더 정리 보류:', error.code); }
}
