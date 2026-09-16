[English](./README.en.md) · [HTML](./README.html) · [원본 프로젝트](https://github.com/sodam-ai/SoDam_O-Brain)

# 소담 오브레인 Codex (SoDam O-Brain for Codex)

O-Brain은 Codex 대화에서 사용자가 확정한 결정·제약·선호·지식을 **내 컴퓨터의 SQLite DB에 저장**하고, 다음 작업에서 관련 기억을 다시 보여주는 1인용 로컬 메모리 플러그인입니다. 2D/3D 그래프, 목록, 타임라인, 검색, 백업 화면도 함께 제공합니다.

> 현재 문서는 로컬 포팅 폴더 `D:\AI_Dev_Work\2026y\26y_09m_16d_SoDam_O-Brain-Codex` 기준입니다. 이 Codex 포팅 저장소의 공개 GitHub 주소는 아직 지정되지 않았으므로 임의의 다운로드 주소를 적지 않았습니다.

## 목차

1. [무엇을 할 수 있나요?](#무엇을-할-수-있나요)
2. [사전 준비물](#사전-준비물)
3. [설치](#설치)
4. [빠른 시작](#빠른-시작)
5. [사용 방법](#사용-방법)
6. [명령과 테스트](#명령과-테스트)
7. [파일과 데이터 위치](#파일과-데이터-위치)
8. [작동 흐름과 아키텍처](#작동-흐름과-아키텍처)
9. [보안과 개인정보](#보안과-개인정보)
10. [업데이트 내용](#업데이트-내용)
11. [문제 해결](#문제-해결)
12. [FAQ](#faq)
13. [라이선스·저작권·상업적 사용](#라이선스저작권상업적-사용)

## 무엇을 할 수 있나요?

| 기능 | 설명 |
|---|---|
| 자동 저장 | Codex `SessionEnd` 훅이 최근 대화에서 확정 문장을 찾아 저장합니다. 질문·잡담·AI 답변은 저장 대상에서 제외합니다. |
| 자동 되읽기 | `SessionStart` 훅이 현재 프로젝트와 관련된 기억을 소량 골라 Codex 문맥에 넣습니다. |
| MCP 7개 도구 | 검색, 저장, 단건 조회, 관련 기억, 타임라인, 관계 추가, 카테고리 목록을 제공합니다. |
| 로컬 검색 | FTS5 키워드 검색과 384차원 로컬 임베딩 검색을 함께 사용합니다. |
| 시각화 | 개요, 목록/상세, 2D·3D 그래프, 타임라인, 설정 화면을 제공합니다. |
| 데이터 안전 | SQLite WAL, 온라인 백업, 입력 제한, 시크릿 가림, 삭제 전 백업을 사용합니다. |
| 호환 파서 | Codex `response_item` 로그와 원본 Claude Code 로그를 모두 읽습니다. Codex 포팅의 기본 도구 값은 `codex`입니다. |

O-Brain은 사용자의 모든 말을 무조건 저장하지 않습니다. “하기로 정했다”, “반드시”, “선호한다”처럼 확정 신호가 있는 사용자 문장을 규칙으로 선별합니다. 중요한 내용은 `$o-brain-remember`로 직접 저장할 수 있습니다.

## 사전 준비물

- Windows 10/11 또는 Node.js 26.7.x를 실행할 수 있는 컴퓨터
- **Node.js 26.7.x**와 npm 11.x
- 플러그인을 지원하는 Codex 앱 또는 Codex CLI
- 최초 `npm ci`와 임베딩 모델 다운로드 때의 인터넷 연결
- 약 1GB 이상의 여유 공간 권장: Node 의존성과 로컬 임베딩 모델 캐시가 포함됩니다.

확인 명령:

```powershell
node --version
npm --version
codex --version
```

이 포팅을 검증한 버전은 Node.js `v26.7.0`, npm `11.6.2`, Codex CLI `0.154.0`입니다. 다른 버전은 동작할 수 있지만 이 문서에서 확인했다고 보장하지 않습니다.

## 설치

### 1. 로컬 마켓플레이스 등록

PowerShell에서 포팅 폴더로 이동합니다.

```powershell
cd "D:\AI_Dev_Work\2026y\26y_09m_16d_SoDam_O-Brain-Codex"
codex plugin marketplace add .
```

### 2. 플러그인 설치

```powershell
codex plugin add o-brain@o-brain-codex
```

설치 확인:

```powershell
codex plugin list | Select-String "o-brain"
```

### 3. 의존성 준비

Codex를 새 작업으로 열고 다음처럼 요청합니다.

```text
$o-brain-setup 스킬로 처음 설정하고 자체 테스트까지 실행해줘.
```

수동으로 할 때는 설치한 플러그인 루트에서 다음을 실행합니다.

```powershell
node scripts/o-brain-cli.mjs setup
node scripts/o-brain-cli.mjs selftest
```

설정은 `npm ci`로 잠금 파일에 고정된 의존성을 설치합니다. 최초 검색 또는 테스트 때 `sentence-transformers/all-MiniLM-L6-v2` 모델이 내려받아질 수 있습니다.

### 업데이트

로컬 폴더를 수정한 뒤 플러그인 캐시를 갱신합니다.

```powershell
codex plugin remove o-brain@o-brain-codex
codex plugin add o-brain@o-brain-codex
```

다시 `$o-brain-setup`을 실행합니다. 개인 기억 DB는 플러그인 캐시 밖에 있어 일반적인 재설치로 삭제되지 않습니다.

### 제거

```powershell
codex plugin remove o-brain@o-brain-codex
codex plugin marketplace remove o-brain-codex
```

이 명령은 플러그인을 제거하지만 개인 DB는 자동 삭제하지 않습니다. 데이터를 삭제하려면 먼저 백업한 뒤 `%LOCALAPPDATA%\SoDamAI\O-Brain` 폴더를 사용자가 직접 확인하고 삭제해야 합니다.

## 빠른 시작

1. 설치 후 Codex를 새 작업으로 엽니다.
2. `$o-brain-setup`을 한 번 실행합니다.
3. 대화에서 “이 프로젝트의 테스트 포트는 7740으로 사용하기로 결정했다”처럼 확정된 결정을 말합니다.
4. 작업을 정상 종료합니다. `SessionEnd` 훅이 시크릿을 가린 뒤 후보를 저장합니다.
5. 새 작업을 열면 `SessionStart` 훅이 관련 기억을 찾아 문맥에 넣습니다.
6. 화면으로 확인하려면 `$o-brain-open`을 실행합니다.

독립 웹 앱만 시험하려면:

```powershell
cd app
npm ci
npm start
```

브라우저에서 `http://127.0.0.1:7740/`을 엽니다. 직접 `npm start`로 실행하면 데이터 기본 위치는 `app/data/`입니다. Codex 플러그인 실행 경로는 사용자 데이터 폴더를 기본으로 사용합니다.

## 사용 방법

### Codex 스킬

| 스킬 | 용도 |
|---|---|
| `$o-brain-setup` | 최초 의존성 설치와 자체 테스트 |
| `$o-brain-open` | 로컬 서버 확인·시작 후 대시보드 열기 |
| `$o-brain-status` | 기억 수, 최근 기억, 데이터 위치 확인 |
| `$o-brain-backup` | 실행 중에도 안전한 SQLite 스냅샷 생성 |
| `$o-brain-selftest` | 실제 개인 DB와 분리된 테스트 DB로 핵심 기능 검사 |
| `$o-brain-remember` | 현재 대화에서 확정된 내용만 수동 저장 |
| `$o-brain-link` | 사용자가 확인한 기억 관계만 연결 |

### MCP 도구

| 도구 | 용도 |
|---|---|
| `search_memory` | 의미+키워드 검색 |
| `save_memory` | 시크릿 가림 후 기억 저장 |
| `get_memory` | 기억 1건 전체 조회 |
| `get_related` | 직접 연결된 기억 조회 |
| `get_timeline` | 주제별 시간 흐름 조회 |
| `add_relation` | `SUPERSEDES`, `SUPPORTS`, `INFLUENCES`, `CONTRADICTS` 관계 추가 |
| `list_categories` | 카테고리별 기억 수 조회 |

관계 종류는 O-Brain이 자동 확정하지 않습니다. 잘못된 인과관계를 만들지 않도록 사용자가 확인한 관계만 저장합니다.

### 대시보드

- **개요**: 기억 수, 유형, 카테고리, 최근 상태
- **목록**: 검색, 필터, 상세, 수정, 삭제, 중복 정리
- **그래프**: 2D/3D 연결 구조와 최단 경로
- **타임라인**: 결정이 바뀐 순서와 관계
- **설정**: 백업, 내보내기, 데이터 위치

서버는 `127.0.0.1`에만 연결됩니다. 같은 PC의 브라우저에서 사용하며 휴대전화나 다른 PC에서 직접 접근하는 기능은 제공하지 않습니다.

## 명령과 테스트

소스 저장소 루트:

```powershell
node plugins/o-brain/scripts/o-brain-cli.mjs setup
node plugins/o-brain/scripts/o-brain-cli.mjs open
node plugins/o-brain/scripts/o-brain-cli.mjs status
node plugins/o-brain/scripts/o-brain-cli.mjs backup
node plugins/o-brain/scripts/o-brain-cli.mjs selftest
```

`app/` 폴더:

```powershell
npm test                 # 파서 + 훅 + MCP + HTTP + 핵심 DB 전체
npm run test:transcript # Codex/Claude 로그 파서
npm run test:hooks      # SessionStart/SessionEnd
npm run test:mcp        # stdio 연결 + 7개 도구
npm run test:server     # 인증/CORS/입력/CRUD
npm run selftest        # 저장/가림/검색/관계/그래프/삭제
npm run status
npm run backup
npm start
```

별도 lint와 TypeScript type check는 설정되어 있지 않습니다. 이 프로젝트는 순수 JavaScript ESM이며 `node --check`, JSON 파싱, 공식 플러그인 validator를 배포 전 검사에 사용합니다.

## 파일과 데이터 위치

| 위치 | 내용 | Git 포함 여부 |
|---|---|---|
| `plugins/o-brain/.codex-plugin/plugin.json` | Codex 플러그인 manifest | 포함 |
| `.agents/plugins/marketplace.json` | 로컬 marketplace | 포함 |
| `plugins/o-brain/plugin.json` | Agent Plugins 1.0 호환 manifest | 포함 |
| `plugins/o-brain/.mcp.json` | O-Brain MCP 등록 | 포함 |
| `plugins/o-brain/hooks/` | Codex 시작·종료 훅 | 포함 |
| `plugins/o-brain/skills/` | 7개 Codex 스킬 | 포함 |
| `plugins/o-brain/scripts/` | 런타임·설정·MCP 실행 도구 | 포함 |
| `app/src/` | DB·검색·서버·파서·테스트 | 포함 |
| `app/web/` | 로컬 대시보드 | 포함 |
| `plugins/o-brain/app/` | 설치용 앱 복사본(개발 데이터 제외) | 포함 |
| `%LOCALAPPDATA%\SoDamAI\O-Brain\data` | 플러그인 모드 개인 DB·백업·내보내기 | **제외** |
| `%LOCALAPPDATA%\SoDamAI\O-Brain\.env.local` | 선택 사용자 설정 | **제외** |
| `app/data/` | 소스 직접 실행/테스트 데이터 | **제외** |

환경 변수:

| 이름 | 기본값 | 설명 |
|---|---|---|
| `OBRAIN_PORT` | `7740` | 로컬 웹 서버 포트(1~65535) |
| `OBRAIN_DATA_DIR` | 플러그인 모드: 사용자 데이터 폴더 | DB 위치를 명시적으로 변경 |
| `OBRAIN_CONFIG_DIR` | Windows: `%LOCALAPPDATA%\SoDamAI\O-Brain` | 플러그인 설정·데이터 기준 폴더 |
| `OBRAIN_VEC_GATE` | `0.92` | 고급 벡터 검색 거리 임계값 |

`.env.local`에는 개인 경로가 들어갈 수 있으므로 Git에 올리지 마세요. API 키는 필요하지 않습니다.

## 작동 흐름과 아키텍처

```text
Codex 세션 시작
  -> SessionStart hook
  -> 프로젝트/직전 대화 파악
  -> SQLite + FTS5 + 로컬 임베딩 검색
  -> 관련 기억 소량을 Codex 문맥에 추가

Codex 세션 종료
  -> SessionEnd hook
  -> Codex JSONL의 user/assistant 문장 파싱
  -> 시스템 문구·인용·질문 제거
  -> 시크릿 가림
  -> 규칙 기반 후보 추출
  -> SQLite 저장

Codex MCP 또는 브라우저
  -> MCP 7개 도구 / 127.0.0.1 HTTP API
  -> 같은 SQLite 데이터
  -> 목록·검색·그래프·타임라인·백업
```

핵심 구성은 Node.js ESM, Express 5, better-sqlite3, sqlite-vec, FTS5, Transformers.js, Force Graph입니다. 별도의 클라우드 DB나 O-Brain 전용 유료 AI API를 호출하지 않습니다.

## 보안과 개인정보

- 서버는 `127.0.0.1`에만 바인딩합니다.
- API는 서버가 매 실행 시 만든 임시 토큰을 요구하고, 비교에는 `timingSafeEqual`을 사용합니다.
- 외부 Origin은 거부하고 CSP, frame 차단, MIME sniffing 차단 헤더를 사용합니다.
- JSON 본문은 64KB, 검색어·저장 내용·페이지 크기에는 상한이 있습니다.
- `sk-...`, 토큰, 비밀번호 등은 추출 전에 `[REDACTED:종류]`로 바꿉니다.
- 훅 입력 전체를 진단 파일에 저장하지 않습니다.
- DB·백업·환경 파일·모델 캐시는 Git에 포함하지 않습니다.
- 큰 대화 로그는 전체가 아니라 끝 20MB만 읽습니다.
- 삭제·중복 정리 전에는 온라인 백업을 만듭니다.

시크릿 가림은 방어 수단이며 모든 비밀 패턴을 완벽히 보장하지 않습니다. 비밀번호, 고객 개인정보, 비공개 원문을 대화에 입력하지 않는 것이 가장 안전합니다. 개인 DB를 공유하거나 납품할 때는 내용을 직접 검토하세요.

## 업데이트 내용

<details>
<summary><strong>v0.2.0 — Codex 포팅 (2026-09-16)</strong></summary>

- Codex 표준 `.codex-plugin`, marketplace, Agent Plugins 1.0 manifest 추가
- Codex `SessionStart`/`SessionEnd` hook과 `${PLUGIN_ROOT}`/Windows 명령 지원
- Codex `response_item`, `turn_context`, `custom_tool_call`, `function_call` 로그 파싱
- Codex용 MCP stdio 자동 등록과 7개 도구 검증
- Claude 슬래시 명령을 7개 Codex 스킬로 변환
- 플러그인 캐시 밖 사용자 데이터 폴더 도입
- 훅 payload 진단 파일 저장 제거
- 파서·훅·MCP·HTTP·DB 자동 테스트 추가
- 로컬 marketplace 설치, 설치 캐시 setup, selftest 실제 검증
- 설치 패키지를 `plugins/o-brain`으로 분리해 개발 의존성과 로컬 데이터의 캐시 혼입 차단

</details>

<details>
<summary><strong>원본 v0.1 계열 — 로컬 기억 앱</strong></summary>

- SQLite + sqlite-vec + FTS5 하이브리드 검색
- 기억 유형·중요도·신뢰도·카테고리·프로젝트 범위
- 수동 관계, 최단 경로, 2D/3D 그래프, 타임라인
- 중복 후보, 확인 후 병합/삭제, 10초 되돌리기
- 백업, 내보내기, 손상 백업 차단, 신뢰도 감쇠
- 로컬 API 토큰, CORS/CSP, 입력 제한, 오류 상세 비노출

</details>

전체 설계 기록은 [`.PRD/`](./.PRD/)에 있으며 Codex 포팅 결정은 [`.PRD/13_CODEX_PORT.md`](./.PRD/13_CODEX_PORT.md)에 정리했습니다.

## 문제 해결

| 증상 | 확인·해결 |
|---|---|
| O-Brain 스킬이 안 보임 | `codex plugin list`에서 설치를 확인하고 Codex를 새 작업으로 다시 엽니다. |
| `ERR_MODULE_NOT_FOUND` | `$o-brain-setup` 또는 `node scripts/o-brain-cli.mjs setup` 실행 |
| Node 버전 오류 | `node --version`이 26.7.x인지 확인 |
| `Marketplace not found` | 먼저 `codex plugin marketplace add .`, 다음에 `codex plugin add o-brain@o-brain-codex`를 별도 실행 |
| 포트 충돌 | 사용자 설정 `.env.local`에 `OBRAIN_PORT=7741`을 넣고 재시작 |
| 기억이 0건 | 질문이나 잡담이 아닌 확정 문장을 말한 뒤 작업을 정상 종료하고 `$o-brain-status` 실행 |
| 자동 저장이 안 됨 | 새 작업에서 플러그인이 활성인지 확인하고 `npm run test:hooks` 실행 |
| 모델 다운로드 실패 | 인터넷 연결과 프록시를 확인한 뒤 selftest 재실행 |
| 대시보드 403 | 저장된 HTML을 파일로 직접 열지 말고 `$o-brain-open`으로 서버를 통해 접속 |
| DB 손상 의심 | 쓰기를 멈추고 `$o-brain-backup` 결과와 `data/backup/`을 보존한 뒤 전문가 확인 |

## FAQ

**Q. 대화가 OpenAI 외의 O-Brain 서버로 전송되나요?**

A. O-Brain 자체는 별도 클라우드 서버를 운영하지 않습니다. O-Brain 저장·검색은 로컬에서 처리됩니다. Codex 대화 처리에는 사용 중인 OpenAI 제품의 별도 약관과 데이터 설정이 적용됩니다.

**Q. API 키가 필요한가요?**

A. O-Brain 전용 API 키는 필요하지 않습니다. Codex 사용 권한과 요금은 OpenAI 서비스 영역입니다.

**Q. 휴대전화에서 볼 수 있나요?**

A. 기본 서버가 `127.0.0.1` 전용이므로 같은 PC에서만 봅니다. 외부 공개는 인증·TLS·방화벽 설계가 추가로 필요하며 현재 지원 범위가 아닙니다.

**Q. 플러그인을 업데이트하면 기억이 사라지나요?**

A. 기본 플러그인 데이터는 `%LOCALAPPDATA%\SoDamAI\O-Brain\data`에 있어 캐시 재설치와 분리됩니다. 그래도 업데이트 전 백업을 권장합니다.

**Q. 자동 저장이 틀릴 수 있나요?**

A. 규칙 기반 추출이므로 누락·오탐 가능성이 있습니다. 대시보드에서 검토하고 중요한 내용은 `$o-brain-remember`로 저장하세요.

## 라이선스·저작권·상업적 사용

O-Brain 소스는 **Apache License, Version 2.0**으로 배포되며 저작권자는 **Copyright 2026 SoDam AI Studio**입니다. 공식 본문은 [`LICENSE`](./LICENSE), 제3자 고지는 [`NOTICE`](./NOTICE)를 확인하세요.

| 사용 | 안내 |
|---|---|
| 개인·교육·회사 내부 사용 | Apache-2.0 조건에 따라 가능 |
| 수정·복제·포크 | 가능. 라이선스·저작권 고지를 유지하고 수정 사실을 표시해야 함 |
| 재배포·판매·서비스·고객 납품 | 가능할 수 있음. LICENSE/NOTICE 제공, 변경 고지, 제3자 권리 확인 필요 |
| 상표·로고 | Apache-2.0이 SoDam AI Studio, O-Brain, OpenAI, Codex 상표 사용권을 주는 것은 아님 |
| 보증·책임 | 소프트웨어는 현 상태로 제공되며 공식 라이선스의 보증 부인·책임 제한 적용 |

추가 확인 사항:

- npm 의존성과 임베딩 모델에는 Apache-2.0, MIT, BSD, ISC, 이중 라이선스가 적용됩니다. `sharp` 플랫폼 바이너리의 패키지 메타데이터에는 LGPL-3.0-or-later 구성요소도 표시되므로, 바이너리를 재배포·납품할 때는 정확한 대상 파일의 고지와 LGPL 의무를 별도로 검토해야 합니다. 버전과 고지는 `package-lock.json`과 `NOTICE`를 기준으로 확인하세요.
- 화면 캡처는 이 프로젝트의 로컬 대시보드에서 제작한 자료입니다. 다른 브랜드 로고·고객 자료를 새로 넣으면 해당 권리를 별도로 확인해야 합니다.
- 사용자가 입력하거나 생성한 코드·문서·프롬프트·AI 결과물의 저작권, 개인정보, 영업비밀, 상업 이용 가능성은 배포 전에 직접 확인해야 합니다.
- OpenAI/Codex 사용, 요금, 결과물, 데이터 처리는 O-Brain 라이선스와 별개로 해당 서비스의 최신 약관이 적용됩니다.
- 고객 납품, 규제 산업, 개인정보 처리, 대규모 상업 배포는 **법무/전문가 검토 필요**입니다.

이 문서는 일반적인 프로젝트 사용 안내이며 법률 자문이 아닙니다.
