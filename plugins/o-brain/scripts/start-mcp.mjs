import { appModuleUrl, prepareRuntime } from './runtime.mjs';
prepareRuntime();
try {
  await import(appModuleUrl('mcp-server.mjs'));
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND') {
    process.stderr.write('[o-brain] 의존성이 없습니다. Codex에서 $o-brain-setup 스킬을 먼저 실행하세요.\n');
  }
  throw error;
}
