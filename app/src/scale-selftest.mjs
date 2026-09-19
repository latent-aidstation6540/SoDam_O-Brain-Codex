import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

const temp = mkdtempSync(join(tmpdir(), 'obrain-scale-selftest-'));
process.env.OBRAIN_DATA_DIR = temp;

const { openDb } = await import('./db.mjs');
const { listMemories, getStats } = await import('./store.mjs');
const { buildGraph } = await import('./graph.mjs');

const db = openDb();
const COUNT = 10_000;

try {
  const insertMemory = db.prepare(
    `INSERT INTO memory(content, type, importance, confidence, source, project, category, scope, valid_from)
     VALUES (?, ?, ?, ?, 'scale-test', ?, ?, 'global', '2026-01-01')`
  );
  const insertFts = db.prepare('INSERT INTO memory_fts(rowid, content) VALUES (?, ?)');
  const insertRelation = db.prepare("INSERT INTO relation(from_id, to_id, type) VALUES (?, ?, 'reference')");
  const seed = db.transaction(() => {
    for (let i = 1; i <= COUNT; i++) {
      const content = `SCALE-${i} project search validation memory`;
      const id = Number(insertMemory.run(content, i % 5 === 0 ? 'decision' : 'knowledge', (i % 5) + 1, 0.8, `project-${i % 20}`, i % 5 === 0 ? 'rules' : 'other').lastInsertRowid);
      insertFts.run(id, content);
      if (i > 1 && i % 100 === 0) insertRelation.run(id - 1, id);
    }
  });

  const seedStart = performance.now();
  seed();
  const seedMs = performance.now() - seedStart;

  const queryStart = performance.now();
  const page = listMemories(db, 100, 9_900);
  const keyword = db.prepare("SELECT m.id, m.content FROM memory_fts f JOIN memory m ON m.id=f.rowid WHERE memory_fts MATCH ? LIMIT 10").all('"SCALE-9999"');
  const stats = getStats(db);
  const graph = buildGraph(db, { limit: 600 });
  const queryMs = performance.now() - queryStart;

  assert.equal(page.length, 100);
  assert.equal(keyword.length, 1);
  assert.match(keyword[0].content, /SCALE-9999/);
  assert.equal(stats.total, COUNT);
  assert.equal(graph.total, COUNT);
  assert.equal(graph.shown, 600);
  assert.equal(graph.simplified, true);
  assert.equal(graph.edgeMode, 'type');
  assert.ok(queryMs < 15_000, `scale query flow too slow: ${queryMs.toFixed(0)}ms`);

  console.log(JSON.stringify({ ok: true, records: COUNT, seedMs: Math.round(seedMs), queryMs: Math.round(queryMs), graphNodes: graph.shown, simplified: graph.simplified }));
} finally {
  db.close();
  rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
}
