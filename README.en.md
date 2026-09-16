[한국어](./README.md) · [HTML](./README.en.html) · [Original project](https://github.com/sodam-ai/SoDam_O-Brain)

# SoDam O-Brain for Codex

O-Brain is a personal, local memory plugin that stores user-confirmed decisions, constraints, preferences, and knowledge from Codex conversations in a **SQLite database on your computer**. It recalls related memories in later tasks and includes 2D/3D graph, list, timeline, search, and backup views.

> This document describes the local port at `D:\AI_Dev_Work\2026y\26y_09m_16d_SoDam_O-Brain-Codex`. No public GitHub URL has been provided for this Codex port, so this guide does not invent a download URL.

## Table of Contents

1. [What It Does](#what-it-does)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [How to Use](#how-to-use)
6. [Commands and Tests](#commands-and-tests)
7. [Files and Data Locations](#files-and-data-locations)
8. [Workflow and Architecture](#workflow-and-architecture)
9. [Security and Privacy](#security-and-privacy)
10. [Updates](#updates)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)
13. [License, Copyright, and Commercial Use](#license-copyright-and-commercial-use)

## What It Does

| Feature | Description |
|---|---|
| Automatic capture | A Codex `SessionEnd` hook finds confirmed statements in recent conversation and saves them. Questions, casual chat, and AI replies are excluded. |
| Automatic recall | A `SessionStart` hook selects a small set of memories related to the current project and adds them to Codex context. |
| Seven MCP tools | Search, save, single-item retrieval, related items, timeline, relation creation, and category listing. |
| Local search | Combines FTS5 keyword search with 384-dimensional local embeddings. |
| Visualization | Overview, list/detail, 2D/3D graph, timeline, and settings views. |
| Data safety | SQLite WAL, online backups, input limits, secret redaction, and pre-delete backups. |
| Compatible parser | Reads Codex `response_item` logs and the original Claude Code logs. Codex sessions are stored with the tool value `codex`. |

O-Brain does not store everything you say. Rule-based extraction selects user statements with clear confirmation signals such as “we decided,” “must,” or “I prefer.” Use `$o-brain-remember` when a critical item should be saved explicitly.

## Prerequisites

- Windows 10/11, or a computer that can run Node.js 26.7.x
- **Node.js 26.7.x** and npm 11.x
- Codex desktop or Codex CLI with plugin support
- Internet access for the first `npm ci` and embedding model download
- At least 1 GB of free space recommended for Node dependencies and the local model cache

Check versions:

```powershell
node --version
npm --version
codex --version
```

This port was verified with Node.js `v26.7.0`, npm `11.6.2`, and Codex CLI `0.154.0`. Other versions may work, but they are not claimed as verified here.

## Installation

### 1. Add the local marketplace

Open PowerShell and move to the port directory.

```powershell
cd "D:\AI_Dev_Work\2026y\26y_09m_16d_SoDam_O-Brain-Codex"
codex plugin marketplace add .
```

### 2. Install the plugin

```powershell
codex plugin add o-brain@o-brain-codex
```

Verify installation:

```powershell
codex plugin list | Select-String "o-brain"
```

### 3. Prepare dependencies

Open a new Codex task and ask:

```text
Use the $o-brain-setup skill to complete first-time setup and run its self-test.
```

For manual setup, run these commands from the installed plugin root:

```powershell
node scripts/o-brain-cli.mjs setup
node scripts/o-brain-cli.mjs selftest
```

Setup runs `npm ci` with the locked dependencies. The first search or test may download the `sentence-transformers/all-MiniLM-L6-v2` model.

### Updating

After changing the local source, refresh the plugin cache:

```powershell
codex plugin remove o-brain@o-brain-codex
codex plugin add o-brain@o-brain-codex
```

Run `$o-brain-setup` again. The personal database is outside the plugin cache and is not removed by a normal reinstall.

### Uninstalling

```powershell
codex plugin remove o-brain@o-brain-codex
codex plugin marketplace remove o-brain-codex
```

These commands remove the plugin but do not automatically delete personal data. To erase it, create a backup first, inspect `%LOCALAPPDATA%\SoDamAI\O-Brain`, and delete that folder yourself.

## Quick Start

1. Open a new Codex task after installation.
2. Run `$o-brain-setup` once.
3. State a confirmed decision, for example: “We decided to use port 7740 for this project's tests.”
4. End the task normally. The `SessionEnd` hook redacts secrets and saves candidates.
5. Start a new task. The `SessionStart` hook recalls related memories into context.
6. Run `$o-brain-open` to inspect the dashboard.

To try only the standalone web app:

```powershell
cd app
npm ci
npm start
```

Open `http://127.0.0.1:7740/`. Direct `npm start` uses `app/data/` by default. Codex plugin entry points use the external user data directory by default.

## How to Use

### Codex skills

| Skill | Purpose |
|---|---|
| `$o-brain-setup` | Install dependencies and run the first self-test |
| `$o-brain-open` | Check/start the local server and open the dashboard |
| `$o-brain-status` | Show memory count, recent items, and data location |
| `$o-brain-backup` | Create a safe online SQLite snapshot |
| `$o-brain-selftest` | Test core behavior in an isolated database |
| `$o-brain-remember` | Manually save only confirmed items from the current conversation |
| `$o-brain-link` | Connect only memory relations confirmed by the user |

### MCP tools

| Tool | Purpose |
|---|---|
| `search_memory` | Semantic and keyword search |
| `save_memory` | Save after secret redaction |
| `get_memory` | Retrieve one full memory |
| `get_related` | Retrieve directly connected memories |
| `get_timeline` | Retrieve chronological history by topic |
| `add_relation` | Add `SUPERSEDES`, `SUPPORTS`, `INFLUENCES`, or `CONTRADICTS` |
| `list_categories` | List memory counts by category |

O-Brain does not automatically decide relation types. Only user-confirmed relations are saved to avoid inventing causality.

### Dashboard

- **Overview**: counts, types, categories, and recent status
- **List**: search, filters, detail, edit, delete, and duplicate cleanup
- **Graph**: 2D/3D relationships and shortest path
- **Timeline**: decision history and relationships
- **Settings**: backup, export, and data location

The server binds only to `127.0.0.1`. It is intended for a browser on the same computer and does not provide direct phone or remote-PC access.

## Commands and Tests

Source repository root:

```powershell
node plugins/o-brain/scripts/o-brain-cli.mjs setup
node plugins/o-brain/scripts/o-brain-cli.mjs open
node plugins/o-brain/scripts/o-brain-cli.mjs status
node plugins/o-brain/scripts/o-brain-cli.mjs backup
node plugins/o-brain/scripts/o-brain-cli.mjs selftest
```

Inside `app/`:

```powershell
npm test                 # parser + hooks + MCP + HTTP + core DB
npm run test:transcript # Codex/Claude transcript parser
npm run test:hooks      # SessionStart/SessionEnd
npm run test:mcp        # stdio handshake + seven tools
npm run test:server     # auth/CORS/input/CRUD
npm run selftest        # save/redact/search/relation/graph/delete
npm run status
npm run backup
npm start
```

No separate lint or TypeScript type-check configuration exists. This is a pure JavaScript ESM project. Release checks use `node --check`, JSON parsing, and the official plugin validator.

## Files and Data Locations

| Location | Contents | In Git? |
|---|---|---|
| `plugins/o-brain/.codex-plugin/plugin.json` | Codex plugin manifest | Yes |
| `.agents/plugins/marketplace.json` | Local marketplace | Yes |
| `plugins/o-brain/plugin.json` | Agent Plugins 1.0-compatible manifest | Yes |
| `plugins/o-brain/.mcp.json` | O-Brain MCP registration | Yes |
| `plugins/o-brain/hooks/` | Codex start/end hooks | Yes |
| `plugins/o-brain/skills/` | Seven Codex skills | Yes |
| `plugins/o-brain/scripts/` | Runtime, setup, and MCP launchers | Yes |
| `app/src/` | DB, search, server, parser, and tests | Yes |
| `app/web/` | Local dashboard | Yes |
| `plugins/o-brain/app/` | Installable app copy without development data | Yes |
| `%LOCALAPPDATA%\SoDamAI\O-Brain\data` | Plugin-mode personal DB, backups, exports | **No** |
| `%LOCALAPPDATA%\SoDamAI\O-Brain\.env.local` | Optional user configuration | **No** |
| `app/data/` | Direct-source and test data | **No** |

Environment variables:

| Name | Default | Purpose |
|---|---|---|
| `OBRAIN_PORT` | `7740` | Local web server port (1–65535) |
| `OBRAIN_DATA_DIR` | Plugin mode: external user data directory | Explicit database location |
| `OBRAIN_CONFIG_DIR` | Windows: `%LOCALAPPDATA%\SoDamAI\O-Brain` | Plugin configuration/data base directory |
| `OBRAIN_VEC_GATE` | `0.92` | Advanced vector distance threshold |

Do not commit `.env.local`; it may contain personal paths. O-Brain does not require an API key.

## Workflow and Architecture

```text
Codex session starts
  -> SessionStart hook
  -> detect project and prior topic
  -> SQLite + FTS5 + local embedding search
  -> add a small set of related memories to Codex context

Codex session ends
  -> SessionEnd hook
  -> parse user/assistant messages from Codex JSONL
  -> remove host text, quotes, and questions
  -> redact secrets
  -> rule-based candidate extraction
  -> store in SQLite

Codex MCP or browser
  -> seven MCP tools / 127.0.0.1 HTTP API
  -> same SQLite data
  -> list, search, graph, timeline, backup
```

The core stack is Node.js ESM, Express 5, better-sqlite3, sqlite-vec, FTS5, Transformers.js, and Force Graph. O-Brain does not call a separate cloud database or an O-Brain-specific paid AI API.

## Security and Privacy

- The server binds only to `127.0.0.1`.
- API requests require an ephemeral token generated on each server start and compared with `timingSafeEqual`.
- External origins are rejected; CSP, frame blocking, and MIME sniffing protection are enabled.
- JSON bodies are limited to 64 KB, and search text, saved content, and page sizes have bounds.
- Patterns such as `sk-...`, tokens, and passwords are replaced with `[REDACTED:type]` before extraction.
- Hook payloads are not dumped to diagnostic files.
- Databases, backups, env files, and model caches are excluded from Git.
- Very large transcripts read only the final 20 MB.
- Deletion and duplicate cleanup create an online backup first.

Redaction is a defense layer and cannot guarantee detection of every secret format. The safest practice is to avoid entering passwords, customer personal data, or private source material into conversations. Review a personal database before sharing or delivering it.

## Updates

<details>
<summary><strong>v0.2.0 — Codex port (2026-09-16)</strong></summary>

- Added Codex-standard `.codex-plugin`, marketplace, and Agent Plugins 1.0 manifests
- Added Codex `SessionStart`/`SessionEnd` hooks with `${PLUGIN_ROOT}` and Windows commands
- Added parsing for Codex `response_item`, `turn_context`, `custom_tool_call`, and `function_call`
- Added automatic MCP stdio registration and verified all seven tools
- Converted Claude slash commands into seven Codex skills
- Moved plugin-mode personal data outside the plugin cache
- Removed hook payload diagnostic-file storage
- Added parser, hook, MCP, HTTP, and DB automated tests
- Live-verified local marketplace installation, cached-plugin setup, and self-test
- Isolated `plugins/o-brain` as the install package so development dependencies and local data cannot enter the plugin cache

</details>

<details>
<summary><strong>Original v0.1 line — local memory app</strong></summary>

- SQLite + sqlite-vec + FTS5 hybrid search
- Memory types, importance, confidence, categories, and project scope
- Manual relations, shortest path, 2D/3D graph, and timeline
- Duplicate candidates, confirmed merge/delete, and 10-second undo
- Backup, export, corrupt-backup blocking, and confidence decay
- Local API token, CORS/CSP, input limits, and generic error responses

</details>

Full design history is in [`.PRD/`](./.PRD/), and the Codex port decision is in [`.PRD/13_CODEX_PORT.md`](./.PRD/13_CODEX_PORT.md).

## Troubleshooting

| Symptom | Check / fix |
|---|---|
| O-Brain skills are missing | Check `codex plugin list`, then open a new Codex task. |
| `ERR_MODULE_NOT_FOUND` | Run `$o-brain-setup` or `node scripts/o-brain-cli.mjs setup`. |
| Node version error | Confirm `node --version` is 26.7.x. |
| `Marketplace not found` | Run `codex plugin marketplace add .` first, then `codex plugin add o-brain@o-brain-codex`. |
| Port conflict | Put `OBRAIN_PORT=7741` in the user `.env.local` and restart. |
| Zero memories | State a confirmed decision, end the task normally, then run `$o-brain-status`. |
| Automatic capture fails | Confirm the plugin is active in a new task and run `npm run test:hooks`. |
| Model download fails | Check internet/proxy access and rerun selftest. |
| Dashboard returns 403 | Do not open the saved HTML directly; use `$o-brain-open` and the local server URL. |
| Suspected DB damage | Stop writes, preserve `$o-brain-backup` output and `data/backup/`, then seek expert review. |

## FAQ

**Q. Does O-Brain send conversations to an O-Brain server?**

A. O-Brain does not operate a separate cloud service. O-Brain storage and search are local. Codex conversation processing remains subject to the terms and data settings of the OpenAI product you use.

**Q. Is an API key required?**

A. O-Brain needs no dedicated API key. Codex access and fees belong to the OpenAI service.

**Q. Can I view it on a phone?**

A. The default server is limited to `127.0.0.1` and the same computer. External publishing requires additional authentication, TLS, and firewall design and is outside the current scope.

**Q. Will an update delete memories?**

A. Plugin-mode data defaults to `%LOCALAPPDATA%\SoDamAI\O-Brain\data`, separate from the cache. A backup before updating is still recommended.

**Q. Can automatic capture be wrong?**

A. Rule-based extraction can miss or misclassify statements. Review the dashboard and use `$o-brain-remember` for critical items.

## License, Copyright, and Commercial Use

O-Brain source is licensed under the **Apache License, Version 2.0**, with **Copyright 2026 SoDam AI Studio**. See [`LICENSE`](./LICENSE) for the official text and [`NOTICE`](./NOTICE) for third-party notices.

| Use | Guidance |
|---|---|
| Personal, educational, internal company use | Allowed under Apache-2.0 conditions |
| Modification, copying, and forks | Allowed; retain license/copyright notices and mark changes |
| Redistribution, sale, service operation, client delivery | May be allowed; provide LICENSE/NOTICE, disclose changes, and verify third-party rights |
| Trademarks and logos | Apache-2.0 does not grant rights to SoDam AI Studio, O-Brain, OpenAI, or Codex marks |
| Warranty and liability | Provided as-is under the official license disclaimer and limitation of liability |

Additional checks:

- npm dependencies and the embedding model use Apache-2.0, MIT, BSD, ISC, or dual licensing. Package metadata for `sharp` platform binaries also identifies LGPL-3.0-or-later components, so redistribution or client delivery of binaries requires a separate review of the exact artifacts, notices, and LGPL obligations. Use `package-lock.json` and `NOTICE` to verify versions and notices.
- Screenshots were produced from this project's local dashboard. Any new brand logos or customer content require separate rights review.
- Before distribution, users must verify copyright, privacy, trade-secret, and commercial-use rights for their code, documents, prompts, and AI-generated output.
- OpenAI/Codex use, fees, output, and data processing are governed by the service's current terms, separate from O-Brain's license.
- Client delivery, regulated industries, personal-data processing, and large commercial distribution **require legal/professional review**.

This document provides general project information and is not legal advice.
