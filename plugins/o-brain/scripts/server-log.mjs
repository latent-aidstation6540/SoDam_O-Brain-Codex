import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const SERVER_LOG_LIMIT = 1024 * 1024;
export const SERVER_LOG_KEEP = 3;

export function rotateServerLog(logFile, { maxBytes = SERVER_LOG_LIMIT, keep = SERVER_LOG_KEEP } = {}) {
  mkdirSync(dirname(logFile), { recursive: true });
  if (!existsSync(logFile) || statSync(logFile).size < maxBytes) return false;
  for (let index = Math.max(1, keep - 1); index >= 1; index--) {
    const source = `${logFile}.${index}`;
    const destination = `${logFile}.${index + 1}`;
    if (!existsSync(source)) continue;
    rmSync(destination, { force: true });
    renameSync(source, destination);
  }
  const firstArchive = `${logFile}.1`;
  rmSync(firstArchive, { force: true });
  renameSync(logFile, firstArchive);
  return true;
}

export function openServerLog(configDir, options = {}) {
  const logFile = join(configDir, 'logs', 'server.log');
  rotateServerLog(logFile, options);
  const stdout = openSync(logFile, 'a', 0o600);
  const stderr = openSync(logFile, 'a', 0o600);
  let closed = false;
  return {
    logFile,
    stdio: ['ignore', stdout, stderr],
    close() {
      if (closed) return;
      closed = true;
      closeSync(stdout);
      closeSync(stderr);
    }
  };
}

function sanitizeLogLine(line) {
  return String(line)
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, '[REDACTED]')
    .replace(/\b(token|password|secret)=\S+/gi, '$1=[REDACTED]')
    .replace(/[A-Za-z]:\\[^\r\n]+/g, '[local-path]');
}

export function readRecentServerIssues(logFile, maxLines = 5) {
  if (!existsSync(logFile)) return [];
  const text = readFileSync(logFile, 'utf8').slice(-64 * 1024);
  return text.split(/\r?\n/)
    .filter(line => /\b(error|failed|failure|EADDRINUSE)\b|실패/i.test(line))
    .map(sanitizeLogLine)
    .slice(-Math.max(1, maxLines));
}
