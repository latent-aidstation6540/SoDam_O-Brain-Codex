# O-Brain 법률·저작권·라이선스·상업적 사용 가이드

[English](./LEGAL_GUIDE.en.md) · [LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [제3자 라이선스 목록](./THIRD_PARTY_LICENSES.md)

> 기준일: 2026-09-23. 이 문서는 확인된 프로젝트 사실을 설명하며 법률 자문이 아닙니다. 계약, 상표, 개인정보, 규제 산업, 바이너리 재배포는 **법무/전문가 검토 필요**입니다.

## 1. 확인된 기본 상태

- 프로젝트 라이선스: **Apache License, Version 2.0**(SPDX: `Apache-2.0`)
- 저작권: **Copyright 2026 SoDam AI Studio**
- 공식 라이선스 본문: `LICENSE`
- 프로젝트·직접 의존성 고지: `NOTICE`
- 잠금 파일 전체 목록: `THIRD_PARTY_LICENSES.md`
- 루트와 배포 플러그인은 같은 `LICENSE`·`NOTICE`·제3자 목록을 포함합니다.
- Apache License 2.0은 Apache Software Foundation이 현재 공개하는 2.0 버전입니다.

## 2. 어디까지 사용할 수 있나요?

| 사용 | 현재 판단 | 반드시 지킬 조건 |
|---|---|---|
| 개인·교육·회사 내부 사용 | 가능 | 관련 법률과 외부 서비스 약관 준수 |
| 복제·포크·수정 | 가능 | LICENSE·저작권 고지 유지, 수정 파일에 변경 사실 표시 |
| 소스 재배포 | 가능 | LICENSE·NOTICE·제3자 고지 제공 |
| 판매·유료 지원 | 가능 | 제3자 권리, 세금·소비자·계약 의무 별도 준수 |
| 온라인 서비스 운영 | 라이선스상 가능, 현재 제품 기능은 미지원 | 서버가 `127.0.0.1` 전용이므로 원격 운영에는 별도 개발과 인증·개인정보·보안·OpenAI/Codex 약관 검토 필요 |
| 회사·고객사 납품 | 조건부 가능 | 실제 납품 파일과 계약을 법무/전문가가 검토 |
| `node_modules`·설치본·실행 파일 재배포 | 조건부 | sharp/libvips LGPL 의무를 실제 플랫폼 산출물 기준으로 검토 |

Apache-2.0은 상업적 사용을 금지하지 않지만 제3자 구성요소, 입력 데이터, AI 결과물, 상표, 서비스 약관까지 보장하지는 않습니다.

## 3. 재배포할 때 해야 할 일

1. `LICENSE`, `NOTICE`, `THIRD_PARTY_LICENSES.md`를 함께 제공합니다.
2. 수정한 파일에는 원본을 변경했다는 사실을 눈에 띄게 표시합니다.
3. 적용되는 저작권·특허·상표·귀속 고지를 보존합니다.
4. 최종 패키지에 포함된 정확한 의존성과 네이티브 바이너리를 다시 스캔합니다.
5. 별도 보증·지원·배상 책임을 판매자가 제공한다면 자신의 이름과 책임으로 제공합니다.
6. “현 상태(AS IS)”, 보증 없음, 책임 제한은 `LICENSE` 제7·8조를 따릅니다.

## 4. 외부 구성요소

- 잠금 파일에는 의존성 경로 333개가 있습니다. 런타임 241개, 개발 전용 92개이며 라이선스 메타데이터 누락은 0건입니다.
- 직접 의존성은 Apache-2.0, MIT 또는 이중 라이선스입니다. 잠금 파일에는 `OR`, `AND`, LGPL, CC0, WTFPL, BlueOak 표현도 있으므로 실제 배포 파일의 라이선스 원문을 최종 기준으로 삼아야 합니다.
- 선택적 sharp/libvips 플랫폼 항목 14개에는 `LGPL-3.0-or-later`가 포함됩니다.
- all-MiniLM-L6-v2 모델 저장소는 모델을 Apache-2.0으로 표시합니다. 모델은 최초 사용 때 별도 캐시에 내려받으며 저장소에는 모델 가중치를 포함하지 않습니다. 모델 파일이나 캐시를 재배포하면 해당 모델의 LICENSE와 고지를 함께 검토·제공해야 합니다.
- 현재 소스 저장소에는 `node_modules`, 설치 프로그램, 실행 파일, 컨테이너가 포함되지 않습니다. 배포 시 설치되는 OS·CPU별 파일이 다르므로 잠금 파일만 보고 바이너리 의무가 끝났다고 판단하면 안 됩니다.

## 5. 코드·문서·이미지·샘플 데이터

- 코드와 문서에는 AI가 생성하거나 보조한 내용이 포함될 수 있습니다. 공개·판매·납품 전 사람이 출처, 유사 저작물, 상업 이용 가능성, 정확성을 검토해야 합니다.
- 현재 스크린샷 5개(`graph-2d.png`, `list-detail.png`, `overview.png`, `settings.png`, `timeline.png`)는 프로젝트의 로컬 대시보드 화면이며 PNG 텍스트·EXIF·ICC·XMP 메타데이터가 없습니다. 저장소에는 별도의 외부 폰트·영상·음원 파일과 `public`·`examples`·`samples` 폴더가 없습니다.
- 코드의 예제 포트 번호와 `[REDACTED:api-key]`는 더미값입니다. 스크린샷의 화면 글자는 이번 회차에 육안 검수하지 못했으므로 공개·납품 직전에 실명·이메일·고객사·비밀키 포함 여부를 직접 확인해야 합니다.
- Linear, Vercel, shadcn/ui 등의 이름은 더미 예시입니다. 제휴·후원·보증이나 상표 사용권을 뜻하지 않습니다.
- 시스템 폰트와 직접 작성한 CSS·인라인 기호를 사용합니다. 새 이미지·폰트·아이콘·영상·음원·템플릿을 추가하면 출처와 상업 이용 조건을 기록해야 합니다.
- 개인 DB, 백업, `.env.local`, 대화 로그, 고객 자료는 배포물에 포함하지 않습니다.

## 6. OpenAI/Codex와 AI 결과물

O-Brain 자체는 전용 유료 API 키를 요구하지 않지만 Codex 사용에는 사용자의 OpenAI 계정·요금제·최신 약관·사용 정책이 별도로 적용됩니다. 개인용과 기업/API용 약관이 다를 수 있으므로 배포·납품 시 해당 계정 유형의 최신 원문을 확인하세요.

AI 결과물은 비고유하거나 제3자 자료와 유사할 수 있습니다. 사용자가 입력 권한을 확보하고, 결과물의 정확성·권리·개인정보·영업비밀·규제 적합성을 사람이 검토해야 합니다.

## 7. 공개·배포 전 체크리스트

**Must Have**

- LICENSE·NOTICE·제3자 목록 동봉
- 실제 배포 산출물 기준 의존성 라이선스 재검사
- 비밀키·개인정보·고객 자료·로컬 DB 제외
- 수정 사실 표시와 상표·제휴 오인 방지
- 바이너리 납품 시 LGPL 의무 검토

**Should Have**

- 고객 계약의 보증·배상·지원·데이터 처리 조건 검토
- O-Brain/SoDam AI Studio 명칭의 공식 상표 검색
- SBOM 또는 배포 파일 목록 보관

**Could Have**

- CI에서 라이선스 정책과 SBOM 자동 생성
- 릴리스마다 스크린샷·샘플 데이터 재검사

## 8. 법무/전문가 검토 필요

- sharp/libvips 포함 바이너리·설치본·컨테이너 재배포 의무
- 고객 납품 계약, 보증, 배상, SLA, 개인정보 처리위탁
- 제품명·로고의 국가별 상표 충돌
- 규제 산업 또는 개인정보·고객 데이터를 다루는 운영
- AI 생성 코드·문서·이미지의 개별 침해 가능성

확인되지 않은 권리는 보장하지 않습니다.

## 9. 확인 원문

- [Apache License, Version 2.0 공식 본문](https://www.apache.org/licenses/LICENSE-2.0)
- [Apache Software Foundation의 라이선스 적용 안내](https://www.apache.org/legal/apply-license)
- [all-MiniLM-L6-v2 모델 LICENSE](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/main/LICENSE)
- [sharp-libvips 제3자 고지](https://github.com/lovell/sharp-libvips/blob/main/THIRD-PARTY-NOTICES.md)
- [OpenAI 이용약관](https://openai.com/policies/terms-of-use/)
- [OpenAI 서비스 계약(기업·개발자)](https://openai.com/policies/services-agreement/)
- [OpenAI 서비스별 약관](https://openai.com/policies/service-terms/)
- [OpenAI 앱 개발자 약관](https://openai.com/policies/developer-apps-terms/)