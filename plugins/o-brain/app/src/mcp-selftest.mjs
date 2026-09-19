import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const pluginRoot = existsSync(join(root, 'scripts', 'start-mcp.mjs')) ? root : join(root, 'plugins', 'o-brain');
const tempRoot = join(root, 'app', 'data');
mkdirSync(tempRoot, { recursive: true });
const temp = mkdtempSync(join(tempRoot, '_mcp-selftest-'));
const client = new Client({ name: 'o-brain-selftest', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [join(pluginRoot, 'scripts', 'start-mcp.mjs')],
  cwd: pluginRoot,
  env: { ...process.env, OBRAIN_APP_ROOT: join(root, 'app'), OBRAIN_DATA_DIR: join(temp, 'data') },
  stderr: 'pipe'
});
try {
  await client.connect(transport);
  const listed = await client.listTools();
  const names = listed.tools.map(tool => tool.name).sort();
  assert.deepEqual(names, ['add_relation', 'get_memory', 'get_related', 'get_timeline', 'list_categories', 'save_memory', 'search_memory']);
  const saved = await client.callTool({ name: 'save_memory', arguments: { content: 'MCP 통합 테스트는 임시 데이터만 사용한다.', type: '제약', importance: 5 } });
  const savePayload = JSON.parse(saved.content[0].text);
  assert.equal(savePayload.saved, true);
  const fetched = await client.callTool({ name: 'get_memory', arguments: { id: savePayload.id } });
  assert.match(fetched.content[0].text, /MCP 통합 테스트/);
  console.log('✅ MCP stdio handshake, 7 tools, save_memory, get_memory');
} finally {
  await client.close().catch(() => {});
  await new Promise(resolve => { setTimeout(resolve, 750); });
  try { rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); }
  catch (error) { console.warn('[selftest] 임시 폴더 정리 보류:', error.code); }
}
