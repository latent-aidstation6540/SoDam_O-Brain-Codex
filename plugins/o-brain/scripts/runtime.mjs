import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLUGIN_ROOT = join(HERE, '..');
export const APP_ROOT = process.env.OBRAIN_APP_ROOT ? resolve(process.env.OBRAIN_APP_ROOT) : join(PLUGIN_ROOT, 'app');
const platformConfig = process.platform === 'win32' && process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'SoDamAI', 'O-Brain')
  : join(homedir(), '.o-brain');
export const CONFIG_DIR = process.env.OBRAIN_CONFIG_DIR || platformConfig;

export function prepareRuntime() {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const configFile = join(CONFIG_DIR, '.env.local');
  const sourceFile = join(APP_ROOT, '.env.local');
  for (const file of [configFile, sourceFile]) {
    if (!existsSync(file)) continue;
    try { process.loadEnvFile(file); }
    catch (error) { process.stderr.write(`[o-brain] 설정 파일을 읽지 못했습니다: ${error?.message || error}\n`); }
  }
  if (!process.env.OBRAIN_DATA_DIR) process.env.OBRAIN_DATA_DIR = join(CONFIG_DIR, 'data');
  return { pluginRoot: PLUGIN_ROOT, appRoot: APP_ROOT, configDir: CONFIG_DIR, dataDir: process.env.OBRAIN_DATA_DIR };
}

export const appModuleUrl = (name) => pathToFileURL(join(APP_ROOT, 'src', name)).href;
