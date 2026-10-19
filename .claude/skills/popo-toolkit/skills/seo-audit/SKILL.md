---
name: seo-audit
description: PoPo애견미용실 사이트의 검색 노출 점검. title·description·OG·canonical·robots·sitemap·LocalBusiness 구조화 데이터·네이버 서치어드바이저 준비 상태를 확인하고 고친다. 메타 태그를 바꾸거나 배포 전, 또는 네이버 검색 노출을 다룰 때 사용.
---

# SEO 점검 (네이버 + 구글)

`docs/business-facts.md`를 먼저 읽고, 확정 값만 사용한다.

## 현재 배포 환경 (2026-10-17)
- 사이트 주소: `https://s73827-bit.github.io/popo_petsalon/` (GitHub Pages, 하위 경로). Manus 주소는 더 이상 쓰지 않는다.
- 이 주소가 들어간 곳: `index.html`의 canonical, og:url, og:image, twitter:image, JSON-LD url·image, `public/sitemap.xml`. 도메인이 바뀌면 전부 함께 바꾸고 `vite.config.js`의 `base`도 `/`로 바꾼다.
- 공유 이미지: `public/og-image.jpg` (1200×630, 크림 배경 + 상호 글자). 로고 원본이 오면 다시 만든다.
- sitemap: `public/sitemap.xml`, `lastmod`는 고정값. **페이지 내용을 바꾸면 lastmod를 그날 날짜로 갱신**한다.
- robots.txt: 하위 경로에서는 검색엔진이 읽지 않으므로 두지 않는다. 자체 도메인을 연결하면 `public/robots.txt`를 추가한다.
- 네이버 인증 메타는 `index.html` `<head>`에 주석으로 자리만 있다.

## 점검표
각 항목을 ✅/❌/⚠️로 표시하고, ❌는 고친다.

1. **title**: "포포(PoPo)애견미용실 | 안양 관양동 애견미용 · 1:1 맞춤 그루밍" 형태. 상호(한글+영문)와 지역 키워드 포함, 40자 안팎.
2. **meta description**: 지역, 1:1 맞춤, 100% 예약제, 영업시간 또는 이벤트 중 핵심 2~3개. 80~120자.
3. **canonical**: 실제 배포 도메인 절대 URL. 자체 도메인이 정해지면 교체.
4. **OG/Twitter**
   - `og:image`는 **절대 URL**이어야 한다 (상대경로 `/popo-logo.png` 금지).
   - 공유용 이미지는 1200×630 권장. 로고만 있는 정사각형이면 사용자에게 공유 이미지 제작을 제안.
   - `og:title`, `og:description`, `og:url`, `og:site_name`("PoPo애견미용실") 확인.
5. **lang**: `<html lang="ko">`.
6. **robots.txt / sitemap.xml**: 크롤링 허용, sitemap 위치 명시. sitemap의 `lastmod`가 요청 시각으로 매번 바뀌면 실제 수정일로 고정하는 방법을 확인(플랫폼 제약이면 보고만).
7. **구조화 데이터**: `application/ld+json`으로 `LocalBusiness` 타입 사용(schema.org에 애견미용 전용 타입이 있는지 작업 시점에 schema.org에서 확인하고, 없으면 LocalBusiness 유지). 포함 항목: name, alternateName("포포"), address(도로명), telephone, openingHoursSpecification, url, image, sameAs(카카오·인스타·네이버). 확정 안 된 값은 넣지 않는다.
8. **네이버 사이트 인증**: `naver-site-verification` 메타 자리. 값은 사용자가 네이버 서치어드바이저에서 발급받아야 하므로, 없으면 "발급 필요"로 보고한다. 지어내지 않는다.
9. **본문 노출**: 상호·주소·전화·영업시간이 이미지가 아닌 텍스트로 렌더링되는지 (크롤러가 읽을 수 있게).
10. **제목 구조**: h1은 페이지당 1개. 섹션은 h2.
11. **이미지 alt**: 모든 의미 있는 이미지에 한국어 alt.
12. **meta keywords**: 순위에 큰 의미 없음. 있으면 두되 과도한 나열은 줄인다.

## 확인 방법
- `corepack pnpm build` 후 `dist/index.html`에서 실제로 출력되는지 확인한다. CSS·JS·이미지 경로에 `/popo_petsalon/`이 붙었는지도 본다.
- 배포 후에는 실제 주소를 curl로 받아 같은 항목과 `og-image.jpg`·`sitemap.xml` 응답(200)을 확인한다.
- 외부 도구(Rich Results Test, 네이버 서치어드바이저 웹 진단)는 사용자가 직접 실행해야 한다고 안내한다.

## 보고
점검표 결과 + 고친 내용 + 사용자가 직접 해야 할 일(도메인, 네이버 인증값, 공유 이미지).
