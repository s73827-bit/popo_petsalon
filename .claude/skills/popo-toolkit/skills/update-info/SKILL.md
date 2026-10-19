---
name: update-info
description: PoPo애견미용실 매장 정보(주소, 전화, 영업시간, 주차, 이벤트, 채널 링크)를 docs/business-facts.md 기준으로 사이트 전체에 반영한다. 매장 정보가 바뀌었거나 "오픈 준비 중" 문구를 실제 정보로 바꿀 때 사용.
argument-hint: "[바꿀 항목, 비우면 전체]"
---

# 매장 정보 반영

대상: $ARGUMENTS (비어 있으면 전체 항목)

## 순서
1. `docs/business-facts.md`를 읽는다. 이 파일만 근거로 쓴다.
2. 코드 전체에서 매장 정보가 들어간 곳을 모두 찾는다. `index.html`에는 매장 정보 자리마다 `<!-- [매장정보] -->` 주석이 있으니 먼저 `[매장정보]`로 검색한다. 주석이 없는 곳도 있으니 아래 검색어로 한 번 더 찾는다:
   - 주소: `관양`, `1455`, `동안구`
   - 연락: `tel:`, `010-`, `전화`, `연락처`, `카카오`, `kakao`, `instagram`
   - 시간: `영업`, `시간`, `휴무`
   - 상태: `준비`, `예정`, `추후`, `업데이트`, `모의`
   - 메타: `<title`, `og:`, `description`, `ld+json`
3. 찾은 위치를 표로 정리한다: 파일:줄 / 현재 값 / 바꿀 값 / 근거 행.
4. 확정 값만 교체한다. `TODO`·`미확인` 값이 필요한 자리는:
   - 해당 UI 블록을 숨기거나,
   - "자세한 내용은 카카오톡으로 문의해 주세요" + 채널 링크로 대체한다.
   - 지어낸 값을 넣지 않는다.
5. 연락 버튼을 실제로 동작하게 만든다:
   - 전화: `href="tel:01055897031"`
   - 카카오: `https://pf.kakao.com/_UJDxiX` (새 탭, `rel="noopener"`)
   - 인스타: `https://www.instagram.com/popo_grooming`
6. 오픈 이벤트 배너: 오늘 날짜가 이벤트 종료일 이전이면 노출. 종료일이 지났으면 배너를 제거하라고 보고한다(삭제할 곳: `index.html`의 OPEN EVENT `<aside>` 블록, `src/style.css`의 `.event-*` 규칙).
7. 같은 정보가 반복되는 곳을 함께 고친다. 하나만 바꾸면 사이트 안에서 값이 어긋난다:
   - 주소: 히어로 하단 문구, 오시는 길, 푸터, JSON-LD `address`
   - 전화: 히어로 버튼, FAQ 예약 답변, 오시는 길, 예약 안내, 푸터, 모바일 하단 바, JSON-LD `telephone`, meta description
   - 영업시간·휴무: 히어로 하단 문구, 오시는 길, 예약 안내, 푸터, JSON-LD `openingHoursSpecification`(요일 포함), meta·og·twitter description
8. 페이지 내용이 바뀌었으면 `public/sitemap.xml`의 `lastmod`를 오늘 날짜로 바꾼다.
9. `corepack pnpm build`를 실행해 통과를 확인한다.
10. 사용자가 원하면 커밋하고 `main`에 push한다. push하면 GitHub Actions가 GitHub Pages(`https://s73827-bit.github.io/popo_petsalon/`)에 자동 배포한다.

## 보고 형식
- 바꾼 위치 목록 (파일:줄, 전→후)
- 비어 있어 숨긴 항목과, 채우려면 사용자가 줘야 할 정보
