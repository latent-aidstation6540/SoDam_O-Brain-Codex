import { appModuleUrl, prepareRuntime } from '../scripts/runtime.mjs';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', async () => {
  const output = { continue: true };
  try {
    prepareRuntime();
    const payload = JSON.parse(input || '{}');
    let project = typeof payload.cwd === 'string' ? payload.cwd : '';
    let query = '';
    if (payload.transcript_path) {
      const { detectProject, parseTranscript } = await import(appModuleUrl('extract-session.mjs'));
      project = detectProject(payload.transcript_path, project) || project;
      const { redact } = await import(appModuleUrl('redact.mjs'));
      const exchanges = parseTranscript(payload.transcript_path);
      const lastUser = [...exchanges].reverse().find(item => item.role === 'user' && item.text);
      if (lastUser) {
        const clean = redact(String(lastUser.text)).clean.trim().slice(0, 300);
        if (clean.length >= 6) query = clean;
      }
    }
    const { buildInjection } = await import(appModuleUrl('inject.mjs'));
    const context = await buildInjection({ project, query, max: 8 });
    if (context) output.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: context };
  } catch (error) {
    const missing = error?.code === 'ERR_MODULE_NOT_FOUND';
    process.stderr.write(`[o-brain] 기억 주입 실패: ${error?.message || error}\n`);
    if (missing) {
      output.hookSpecificOutput = {
        hookEventName: 'SessionStart',
        additionalContext: '[O-Brain] 의존성이 설치되지 않았습니다. 사용하려면 $o-brain-setup 스킬을 한 번 실행하세요.'
      };
    }
  }
  process.stdout.write(JSON.stringify(output));
});
if (process.stdin.isTTY) process.stdin.emit('end');
