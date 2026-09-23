# O-Brain Codex Plugin Package

이 폴더는 Codex marketplace가 복사하는 배포 단위입니다. 설치 후 `$o-brain-setup`을 한 번 실행하세요.

개발·전체 문서·테스트는 저장소 루트 `README.md`와 `app/`을 기준으로 합니다. 개인 데이터는 이 폴더가 아니라 Windows `%LOCALAPPDATA%\SoDamAI\O-Brain\data`에 저장됩니다.

배포·납품 전에는 이 폴더의 `LICENSE`, `NOTICE`, `THIRD_PARTY_LICENSES.md`를 보존하고 실제 설치된 네이티브 바이너리의 라이선스를 다시 확인하세요. sharp/libvips가 포함된 바이너리 배포는 **법무/전문가 검토 필요**입니다.

일반 Codex 세션은 `SessionStart`에서 관련 기억을 읽고 `Stop`에서 확정된 사용자 문장을 저장합니다. `codex exec --ephemeral`은 세션 파일을 남기지 않아 이번 검증에서 자동 저장 0건이었습니다. 중요한 결정은 일반 세션 또는 `$o-brain-remember`로 저장하세요.
