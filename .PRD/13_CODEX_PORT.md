# 13 — Codex 포팅 명세

> 상태: 구현·자동 검증·실제 Codex 설치 검증 완료 (2026-09-16)

## 1. 범위

원본 `SoDam_O-Brain`의 로컬 DB, 검색, 대시보드, 보안, 백업 기능을 유지하면서 Claude 전용 패키징을 Codex 플러그인 구조로 교체한다. 원본 저장소와 로컬 원본 데이터는 수정하지 않는다.

## 2. 확정 구조

- `.agents/plugins/marketplace.json`: `o-brain-codex` 로컬 marketplace
- `plugins/o-brain/`: 설치 가능한 최소 Codex 플러그인 패키지
- `plugins/o-brain/.codex-plugin/plugin.json`: Codex manifest
- `plugins/o-brain/.mcp.json`: `scripts/start-mcp.mjs`를 통한 stdio MCP
- `plugins/o-brain/hooks/`: `SessionStart` 되읽기, `Stop` 자동 저장
- `plugins/o-brain/skills/`: setup/open/status/backup/selftest/remember/link
- `app/`: 개발 기준 앱과 전체 자동 테스트
- `plugins/o-brain/app/`: 설치 패키지용 추적 파일 복사본

개발용 `node_modules`, 테스트 DB, 로그, 개인 데이터가 플러그인 캐시에 복사되지 않도록 marketplace는 저장소 루트가 아니라 `plugins/o-brain`만 설치한다. `scripts/check-plugin-package.mjs`가 오염 파일과 개발본/패키지본 불일치를 차단한다.

## 3. Codex 호환 변경

- Codex JSONL의 `response_item.payload.type=message`, `input_text`, `output_text`를 파싱한다.
- `turn_context.payload.cwd`와 tool call 문자열에서 프로젝트를 찾는다.
- session.tool은 자동 탐지하거나 hook에서 `codex`로 지정한다.
- 원본 Claude 로그 파싱은 회귀 호환으로 유지한다.
- `${PLUGIN_ROOT}`와 `commandWindows`를 사용한다.
- 설치 캐시 삭제와 개인 데이터 삭제를 분리하기 위해 데이터 기본 위치를 사용자 설정 폴더로 옮긴다.
- hook payload를 통째로 파일에 기록하지 않는다.

## 4. 설치와 데이터

- marketplace: `o-brain-codex`
- plugin: `o-brain`
- install selector: `o-brain@o-brain-codex`
- Windows data: `%LOCALAPPDATA%\SoDamAI\O-Brain\data`
- 설치된 플러그인의 의존성: `$o-brain-setup` 또는 설치된 플러그인 루트에서 `node scripts/o-brain-cli.mjs setup`
- 소스 저장소 직접 실행: `node plugins/o-brain/scripts/o-brain-cli.mjs <명령>`

## 5. 검증 게이트

1. 공식 plugin validator
2. 모든 JS `node --check`, 모든 JSON `JSON.parse`
3. Codex/Claude transcript parser
4. 실제 hook subprocess capture/injection
5. MCP stdio handshake, 7 tools, save/get
6. HTTP auth, CORS, malformed input, CRUD, boundary pagination
7. 기존 DB selftest
8. `node scripts/check-plugin-package.mjs` 패키지 동기화·오염 검사
9. `codex plugin marketplace add .`와 `codex plugin add` 실제 설치
10. 설치 직후 캐시에 `node_modules`, DB, 개인 데이터가 없는지 확인
11. 설치 캐시에서 setup/selftest/전체 테스트
12. `npm audit`와 민감정보/추적파일 검사

## 6. 의도적 제한

- 모바일·원격 접속은 제공하지 않는다.
- 관계 종류는 사용자가 확정한다.
- 자동 추출은 규칙 기반이며 오탐·누락 가능성이 있다.
- O-Brain은 별도 유료 AI API를 호출하지 않지만 Codex 서비스 조건은 별도다.
- 공개 대상 GitHub URL과 배포 Release는 이번 로컬 포팅 범위에서 지정하지 않는다.
