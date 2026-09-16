---
name: o-brain-selftest
description: "O-Brain 저장, 시크릿 가림, 검색, DB 동작을 실제 개인 데이터와 분리된 임시 DB로 검사한다."
---

# O-Brain 자체 테스트

플러그인 루트에서 `node scripts/o-brain-cli.mjs selftest`를 실행한다. 각 검사 결과를 그대로 확인하고, 모두 통과하면 "두뇌 정상"이라고 알려준다. 실패를 통과로 바꾸거나 실제 기억 DB를 삭제하지 않는다.
