---
name: o-brain-link
description: "관련 기억 사이의 번복, 뒷받침, 영향, 충돌 관계를 사용자의 확인을 거쳐 연결한다."
---

# 기억 관계 연결

1. `search_memory` 또는 `get_related`로 후보를 찾는다.
2. 가능한 관계를 제안하되 자동 확정하지 않는다.
3. 사용자가 확정한 관계만 `add_relation`으로 연결한다.
4. 관계 값은 `SUPERSEDES`, `SUPPORTS`, `INFLUENCES`, `CONTRADICTS` 중 하나다.
5. 연결된 기억 ID와 관계를 요약한다. 같은 관계는 중복 저장하지 않는다.
