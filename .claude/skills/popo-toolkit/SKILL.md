---
name: popo-toolkit
description: PoPo애견미용실 웹사이트 작업의 안내판. 어떤 popo-toolkit 스킬을 언제 쓰는지 알려준다.
disable-model-invocation: true
---

PoPo애견미용실 사이트 작업 도구 목록을 사용자에게 안내하라.

- `/popo-toolkit:update-info` — docs/business-facts.md의 확정 정보를 사이트 전체에 반영
- `/popo-toolkit:copy-check` — 고객에게 보이면 안 되는 문구(준비 중, AI 지시문 등) 검사·수정
- `/popo-toolkit:brand-guide` — 로고 기반 컬러·타이포·톤 규칙 (디자인 작업 시 자동 참조)
- `/popo-toolkit:seo-audit` — 메타 태그, OG, 구조화 데이터, 네이버 등록 준비 점검
- 에이전트 `popo-toolkit:site-reviewer` — 변경 후 독립 검토

권장 순서: update-info → copy-check → brand-guide 적용 → seo-audit → site-reviewer 검토
