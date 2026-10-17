# PoPo애견미용실 웹사이트 — Claude Code 작업 지침

이 저장소는 **PoPo애견미용실(포포)** 공식 홈페이지다. 원래 Manus로 생성한 코드이며, 현재 Manus 배포 주소는 https://popopet-2kcmt2vm.manus.space/ 이다.
2026-10-17 실제 매장이 오픈했다. 사이트는 "오픈 준비 중" 상태로 만들어져 있어 실제 영업 정보로 전환하는 것이 1순위 과제다.

## 1. 사실 정보는 한 곳에서만 가져온다
- 매장 정보(주소·전화·영업시간·이벤트·메뉴)는 **반드시 `docs/business-facts.md`** 에서 가져온다. 기억이나 추측으로 쓰지 않는다.
- 그 파일에 `TODO` 또는 `미확인`으로 표시된 값은 **사이트에 쓰지 않는다.** 해당 UI는 숨기거나 "매장 문의"로 대체하고, 작업 끝에 사용자에게 무엇이 비었는지 보고한다.
- 가격, 후기, 비포/애프터 사진, 자격증, 경력 숫자를 **지어내지 않는다.**

## 2. 코드 환경 (2026-10-17 확인)
- 프레임워크/빌드: **프레임워크 없음. 정적 HTML + 바닐라 JS(ES 모듈) + Vite 7** (`vite.config.js`에서 `index.html`, `admin.html` 두 개를 멀티 페이지로 빌드). SPA 아님 — 공개 페이지의 모든 콘텐츠·메타가 `index.html` 정적 마크업에 들어 있다.
- 페이지 구조: 공개 페이지 전체가 `index.html` 한 파일(섹션 `<section id=…>` 15개). 인터랙션은 `src/main.js`(모바일 메뉴, FAQ 아코디언, 모의 예약 폼, localStorage 후기). 관리자 화면은 `admin.html` + `src/admin.js`.
- 스타일: **순수 CSS 한 파일** `src/style.css` (`:root` CSS 변수 사용, Tailwind 없음). 단, `index.html` 인라인 SVG 로고에 `#26352C` 등 색상이 하드코딩돼 있음.
- 서버/API 유무: `server/`(Express + MySQL + Stripe + Manus OAuth/스토리지)와 `scripts/check-api.mjs`가 **있지만 미사용 상태**. `package.json`에 express 등 의존성이 없고, 공개 페이지(`src/main.js`)는 API를 호출하지 않으며, Dockerfile은 `vite preview`로 정적 결과물만 서빙한다. → 서버 코드는 손대지 않는다(정리 여부는 사용자에게 확인).
- 패키지 매니저: **pnpm** (`pnpm-lock.yaml`, `packageManager: pnpm@11.25.0`). 로컬에 pnpm이 없으면 `corepack pnpm …`으로 실행.
- 명령어: 개발 `pnpm dev`(포트 3000) / 빌드 `pnpm build` / 미리보기 `pnpm preview` / 린트 **없음** / 타입체크 **없음**(TS 미사용)
- 메타 태그 위치: `index.html` `<head>` (title, description, theme-color, OG/Twitter, favicon, JSON-LD). 정적 HTML이므로 초기 HTML에 그대로 들어감. canonical·og:url 없음. `public/manus-routes.json`에 별도 title(`POPO | 안양 관양동 애견미용`)이 있음 — Manus 플랫폼 설정이므로 수정 전 확인.
- 매장 정보 위치: 데이터 파일 분리 없음. 주소·문구가 `index.html` 여러 곳(히어로, 위치, FAQ, 푸터, JSON-LD)과 `server/index.js`의 `address` 상수에 하드코딩.

## 3. 작업 규칙
- 변경 전에 해당 섹션 코드를 먼저 읽고, 기존 컴포넌트·스타일 패턴을 따른다. 새 라이브러리는 사용자 동의 없이 추가하지 않는다.
- 변경 후 빌드(가능하면 타입체크·린트)를 실행해 통과를 확인한다. 실패하면 고치고 다시 실행한다.
- 한 번에 한 단계씩: 사실 정보 교체 → 문구 정리 → 브랜드 디자인 → SEO 순서. 단계마다 무엇을 바꿨는지 짧게 보고한다.
- `.env` 계열 파일은 읽거나 출력하지 않는다.
- Manus 플랫폼 전용 설정(배포·빌드 설정 파일)은 수정 전에 사용자에게 확인한다.

## 4. 브랜드 표기
- 공식 상호: **PoPo애견미용실** (카카오 채널 표기 기준)
- 한글 병기: **포포** — 네이버에서 한글로도 찾을 수 있게 title, 본문 첫 문단, 푸터에 "포포(PoPo)"를 함께 쓴다.
- `POPO`(대문자만) 표기는 PoPo로 통일한다. 인스타 계정명 `popo_grooming`은 그대로 둔다.
- 지역 키워드는 "안양 관양동 애견미용"을 기본으로 한다. "포포"라는 이름의 다른 업체가 있으므로 상호만 단독으로 쓰지 말고 지역과 묶는다.

## 5. 쓰지 말아야 할 문구 (고객에게 노출 금지)
AI 작업 지시처럼 읽히는 문장, 준비 중 문구는 제거 대상이다. `/popo-toolkit:copy-check`로 검사한다.
- "오픈 준비 중", "위치할 예정", "추후 업데이트", "추후 공개", "모의 입력"
- "임의 생성하지 않았습니다", "과장된 '첨단 디지털 시스템' 등의 표현을 쓰지 않으며", "가짜 Before/After는 절대 제작하지 않습니다"
- 브라우저(localStorage)에만 저장되는 후기 작성 기능 → 제거하고 네이버 리뷰 링크로 대체

## 6. 예약·연락 흐름
자체 예약 폼은 만들지 않는다(개인정보 처리방침 의무가 생기고, 실제 접수 시스템도 없음). 대신:
- 전화: `tel:` 링크
- 카카오톡 채널 채팅: `https://pf.kakao.com/_UJDxiX`
- 인스타그램: `https://www.instagram.com/popo_grooming`
- 네이버 플레이스/네이버 예약: `docs/business-facts.md`에 URL이 채워졌을 때만 노출

모바일에서는 화면 하단에 전화·카톡 버튼을 고정하는 것을 기본으로 한다.

## 7. 법적 사항 (참고)
- 사이트에서 개인정보를 수집하는 폼을 다시 만들 경우, 개인정보보호법 제30조에 따른 "개인정보 처리방침" 페이지와 푸터 링크가 필수다.
- 푸터의 사업자 정보·동물미용업 등록번호는 `docs/business-facts.md`에 값이 있을 때만 표기한다.

## 8. 참고 문서
- 매장 사실 정보: @docs/business-facts.md
- 단계별 작업 프롬프트: `docs/prompts/PROMPTS.md`
- 브랜드 가이드·SEO·문구 점검 절차는 `popo-toolkit` 플러그인의 스킬로 들어 있다 (`.claude/skills/popo-toolkit/`).
