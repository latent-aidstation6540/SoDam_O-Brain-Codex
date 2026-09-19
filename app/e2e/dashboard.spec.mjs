import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, '..');
const dataDir = mkdtempSync(join(tmpdir(), 'obrain-dashboard-e2e-'));
let serverProcess;
let port;
let token;
let baseUrl;

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const selected = typeof address === 'object' && address ? address.port : 0;
      server.close(error => error ? reject(error) : resolve(selected));
    });
  });
}

async function waitForServer() {
  const tokenFile = join(dataDir, '.api-token');
  for (let attempt = 0; attempt < 120; attempt++) {
    if (serverProcess.exitCode !== null) throw new Error(`server exited early: ${serverProcess.exitCode}`);
    if (existsSync(tokenFile)) {
      token = readFileSync(tokenFile, 'utf8').trim();
      try {
        const response = await fetch(`${baseUrl}/api/health`, { headers: { 'x-obrain-token': token } });
        if (response.ok) return;
      } catch {}
    }
    await new Promise(resolve => { setTimeout(resolve, 250); });
  }
  throw new Error('dashboard server did not become healthy');
}

async function api(path, options = {}) {
  return await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'x-obrain-token': token, ...(options.headers || {}) }
  });
}

function captureBrowserFailures(page) {
  const failures = [];
  page.on('console', message => { if (message.type() === 'error') failures.push(`console: ${message.text()}`); });
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => failures.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  return failures;
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  port = await freePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, [join(appRoot, 'src', 'server.mjs')], {
    cwd: appRoot,
    env: { ...process.env, OBRAIN_DATA_DIR: dataDir, OBRAIN_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer();
});

test.afterAll(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
    await Promise.race([
      new Promise(resolve => { serverProcess.once('exit', resolve); }),
      new Promise(resolve => { setTimeout(resolve, 5000); })
    ]);
    if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
  }
  rmSync(dataDir, { recursive: true, force: true });
});

test('빈 상태와 대시보드 기본 로딩에 브라우저 오류가 없다', async ({ page }) => {
  const failures = captureBrowserFailures(page);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('O-Brain');
  await expect(page.locator('#graphHost')).toContainText('그릴 기억이 없어요');
  await page.locator('[data-tab="list"]').click();
  await expect(page.locator('#rows')).toContainText('아직 기억이 없어요');
  expect(failures).toEqual([]);
});

test('기억 생성·표시·검색·탭 이동과 API 방어가 작동한다', async ({ page }) => {
  const content = 'E2E-CODEX-7740 브라우저 검증 기억';
  const created = await api('/api/memory', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content, type: '결정', importance: 4, source: 'e2e' })
  });
  expect([200, 201]).toContain(created.status);
  const createdBody = await created.json();
  const failures = captureBrowserFailures(page);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-tab="list"]').click();
  await expect(page.locator('#rows')).toContainText('E2E-CODEX-7740');
  await page.locator('#q').fill('E2E-CODEX-7740');
  await expect(page.locator('#rows')).toContainText('E2E-CODEX-7740');
  for (const tab of ['overview', 'timeline', 'graph']) {
    await page.locator(`[data-tab="${tab}"]`).click();
    await expect(page.locator(`[data-tab="${tab}"]`)).toHaveAttribute('aria-selected', 'true');
  }
  const unauthorized = await fetch(`${baseUrl}/api/health`);
  expect(unauthorized.status).toBe(403);
  const badJson = await api('/api/memory', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad'
  });
  expect(badJson.status).toBe(400);
  const evilOrigin = await api('/api/health', { headers: { origin: 'https://evil.example' } });
  expect(evilOrigin.status).toBe(403);
  expect(failures).toEqual([]);
  const deleted = await api(`/api/memory/${createdBody.id}`, { method: 'DELETE' });
  expect(deleted.ok).toBeTruthy();
});

test('API 실패 화면과 모바일 폭이 안전하게 표시된다', async ({ browser }) => {
  const errorPage = await browser.newPage();
  const failures = captureBrowserFailures(errorPage);
  await errorPage.route('**/api/memories**', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"test"}' }));
  await errorPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await errorPage.locator('[data-tab="list"]').click();
  await expect(errorPage.locator('#rows')).toContainText('불러오지 못했어요');
  expect(failures).toHaveLength(1);
  expect(failures[0]).toMatch(/console: Failed to load resource:.*500/);
  await errorPage.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const mobileFailures = captureBrowserFailures(mobile);
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await expect(mobile.locator('header')).toBeVisible();
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(mobileFailures).toEqual([]);
  await mobile.close();
});
