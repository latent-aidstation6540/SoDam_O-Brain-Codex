import { existsSync, copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { APP_ROOT, CONFIG_DIR, prepareRuntime } from './runtime.mjs';

const command = process.argv[2] || 'help';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const node = process.execPath;
const scriptMap = {
  status: 'status.mjs',
  backup: 'backup-cli.mjs',
  selftest: 'selftest.mjs',
  seed: 'seed.mjs'
};

function run(bin, args, options = {}) {
  const result = spawnSync(bin, args, { cwd: APP_ROOT, stdio: 'inherit', env: process.env, ...options });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

async function health(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch { return false; }
}

function openBrowser(url) {
  if (process.platform === 'win32') spawn('cmd.exe', ['/d', '/s', '/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

if (command === 'setup') {
  prepareRuntime();
  mkdirSync(CONFIG_DIR, { recursive: true });
  const sample = join(APP_ROOT, '.env.local.example');
  const config = join(CONFIG_DIR, '.env.local.example');
  if (existsSync(sample) && !existsSync(config)) copyFileSync(sample, config);
  console.log(`[o-brain] 의존성을 설치합니다: ${APP_ROOT}`);
  if (process.platform === 'win32') run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm.cmd ci --omit=dev --no-audit --no-fund']);
  else run(npm, ['ci', '--omit=dev', '--no-audit', '--no-fund']);
} else if (command === 'open') {
  prepareRuntime();
  const port = Number(process.env.OBRAIN_PORT || 7740);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('OBRAIN_PORT는 1~65535 범위의 정수여야 합니다.');
  if (!(await health(port))) {
    const child = spawn(node, [join(APP_ROOT, 'src', 'server.mjs')], { cwd: APP_ROOT, env: process.env, detached: true, stdio: 'ignore' });
    child.unref();
    for (let i = 0; i < 20 && !(await health(port)); i++) await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!(await health(port))) throw new Error(`O-Brain 서버가 시작되지 않았습니다. 포트 ${port}와 서버 로그를 확인하세요.`);
  const url = `http://127.0.0.1:${port}/`;
  openBrowser(url);
  console.log(`[o-brain] 대시보드: ${url}`);
} else if (scriptMap[command]) {
  prepareRuntime();
  run(node, [join(APP_ROOT, 'src', scriptMap[command])]);
} else {
  console.log('사용법: node scripts/o-brain-cli.mjs <setup|open|status|backup|selftest|seed>');
  process.exitCode = command === 'help' ? 0 : 2;
}
