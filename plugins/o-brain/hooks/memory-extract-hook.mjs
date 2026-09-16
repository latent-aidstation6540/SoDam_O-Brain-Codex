import { appModuleUrl, prepareRuntime } from '../scripts/runtime.mjs';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', async () => {
  try {
    prepareRuntime();
    const payload = JSON.parse(input || '{}');
    const transcriptPath = payload.transcript_path;
    if (!transcriptPath) {
      process.stderr.write('[o-brain] transcript_path가 없어 자동 저장을 건너뜁니다.\n');
      return;
    }
    const { captureSession } = await import(appModuleUrl('extract-session.mjs'));
    const result = await captureSession({ transcriptPath, projectPath: payload.cwd, tool: 'codex' });
    process.stderr.write(`[o-brain] 자동 저장: 대화 ${result.exchanges} → 후보 ${result.candidates} → 저장 ${result.saved.length}건\n`);
  } catch (error) {
    process.stderr.write(`[o-brain] 자동 저장 실패: ${error?.message || error}\n`);
  }
});
if (process.stdin.isTTY) process.stdin.emit('end');
