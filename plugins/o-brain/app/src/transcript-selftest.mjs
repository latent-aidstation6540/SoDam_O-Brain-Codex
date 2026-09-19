import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectProject, detectTranscriptHost, parseTranscript, stripInjected } from './extract-session.mjs';
import { ruleExtract } from './extract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const temp = mkdtempSync(join(here, '..', '_transcript-selftest-'));
try {
  const project = join(temp, 'sample-project');
  mkdirSync(join(project, '.git'), { recursive: true });
  const codexPath = join(temp, 'codex.jsonl');
  const codexLines = [
    { type: 'session_meta', payload: { id: 'test' } },
    { type: 'turn_context', payload: { cwd: project } },
    { type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: '이 프로젝트는 포트 7740을 사용하기로 정하자.' }] } },
    { type: 'response_item', payload: { type: 'function_call', name: 'read_file', arguments: JSON.stringify({ path: join(project, 'README.md') }) } },
    { type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: '알겠습니다.' }] } },
    '{malformed'
  ];
  writeFileSync(codexPath, codexLines.map(line => typeof line === 'string' ? line : JSON.stringify(line)).join('\n'));
  assert.equal(detectTranscriptHost(codexPath), 'codex');
  assert.deepEqual(parseTranscript(codexPath), [
    { role: 'user', text: '이 프로젝트는 포트 7740을 사용하기로 정하자.' },
    { role: 'assistant', text: '알겠습니다.' }
  ]);
  assert.equal(detectProject(codexPath), project);

  const escapedCodexPath = join(temp, 'codex-escaped-path.jsonl');
  writeFileSync(escapedCodexPath, [
    { type: 'turn_context', payload: { cwd: temp } },
    { type: 'response_item', payload: { type: 'custom_tool_call', input: project.replaceAll('\\', '\\\\') + '\\\\README.md' } }
  ].map(JSON.stringify).join('\n'));
  assert.equal(detectProject(escapedCodexPath), project);

  const claudePath = join(temp, 'claude.jsonl');
  writeFileSync(claudePath, [
    { type: 'user', message: { role: 'user', content: [{ type: 'text', text: '한국어를 기본 언어로 사용하자.' }] } },
    { type: 'assistant', message: { role: 'assistant', content: '확인했습니다.' } }
  ].map(JSON.stringify).join('\n'));
  assert.equal(detectTranscriptHost(claudePath), 'claude-code');
  assert.equal(parseTranscript(claudePath).length, 2);

  const stripped = stripInjected('<environment_context>비공개 설정</environment_context>\n실제 결정은 로컬 저장이다.');
  assert.equal(stripped, '실제 결정은 로컬 저장이다.');
  assert.equal(detectProject(join(temp, 'missing.jsonl'), project), project);
  assert.deepEqual(ruleExtract([{ role: 'user', text: '절대 하지 말 것:' }]), []);
  console.log('✅ Codex/Claude transcript parsing, malformed input, injection stripping, project detection');
} finally {
  await new Promise(resolve => { setTimeout(resolve, 750); });
  try { rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); }
  catch (error) { console.warn('[selftest] 임시 폴더 정리 보류:', error.code); }
}
