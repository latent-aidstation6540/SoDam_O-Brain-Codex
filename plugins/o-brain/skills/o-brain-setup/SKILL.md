---
name: o-brain-setup
description: "O-Brain을 처음 설치한 뒤 필요한 Node.js 의존성과 로컬 설정 폴더를 준비한다."
---

# O-Brain 처음 설정

이 스킬의 `SKILL.md`에서 두 단계 위 폴더가 O-Brain 플러그인 루트다.

1. Node.js 버전이 `26.7.x`인지 `node --version`으로 확인한다.
2. 플러그인 루트에서 `node scripts/o-brain-cli.mjs setup`을 실행한다.
3. 이어서 `node scripts/o-brain-cli.mjs selftest`를 실행한다.
4. 성공 여부와 설정 폴더 위치를 쉬운 한국어로 알려준다. 실패는 숨기지 말고 실제 오류를 요약한다.

설정 명령은 개인 기억을 만들거나 삭제하지 않는다. 데이터 기본 위치는 Windows에서 `%LOCALAPPDATA%\SoDamAI\O-Brain\data`다.
