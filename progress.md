# PoPo애견미용실 홈페이지 작업 기록

- 작업일: 2026-10-17 (매장 오픈일), 2026-10-19
- 저장소: https://github.com/s73827-bit/popo_petsalon
- 사이트: https://s73827-bit.github.io/popo_petsalon/ (GitHub Pages)
- 사실 정보 근거: `docs/business-facts.md` (이 파일에 없는 값은 사이트에 쓰지 않는다)
- 마지막 반영 커밋: `3b239bb` (`/sync-docs`가 이 커밋 이후의 변경을 이어서 기록한다)

---

## 한눈에 보기

| 구분 | 작업 전 (Manus) | 작업 후 |
|---|---|---|
| 상태 | "오픈 준비 중" 안내 페이지 | 실제 영업 정보가 들어간 공식 홈페이지 |
| 주소 | 지번 "관양동 1455-11"(미확인) | 도로명 "경기 안양시 동안구 관양로 145 1층 101호" |
| 예약 | 전송되지 않는 모의 예약 폼 | 100% 예약제 안내 + 전화·카카오톡·인스타그램 버튼 |
| 후기 | 브라우저에만 저장되는 후기 작성 기능 | 제거. 네이버 리뷰 자리를 주석으로 숨겨 둠 |
| 디자인 | 짙은 녹색(#26352C), 가짜 엠블럼 로고 | 로고 톤의 크림·베이지·브라운, 텍스트 로고 |
| 섹션 수 | 15개 (내용 중복 많음) | 7개 |
| 메뉴 | 데스크톱 8개 + 모바일 12개 (두 벌) | 한 벌 5개 |
| 코드 | index.html 1,130줄, CSS 1,779줄, 서버 코드 포함 | index.html 583줄, CSS 1,017줄, 서버 없음 |
| 배포 | Manus (`popopet-2kcmt2vm.manus.space`) | GitHub Actions → GitHub Pages |
| 지도 | 없음 | 오시는 길에 구글 지도(Maps Embed API) |

---

## 단계별 작업

### 0단계 — 코드 분석 (수정 없음)
- 스택 확인: 프레임워크 없는 **정적 HTML + 바닐라 JS + Vite 7**, 순수 CSS 한 파일, 패키지 매니저 pnpm.
- `server/`(Express·MySQL·Stripe·Manus OAuth)가 있었지만 `package.json`에 의존성이 없어 **실행되지 않는 코드**였다.
- 예약 폼은 화면 표시만 하고 전송·저장하지 않았고, 후기는 localStorage(방문자 브라우저)에만 저장됐다.
- `og:image`가 존재하지 않는 파일(`/popo-logo.png`)을 상대경로로 가리키고 있었다.
- 결과를 `CLAUDE.md` "2. 코드 환경"에 기록.

### 1단계 — 실제 영업 정보 반영 · `881fa46`
- 시작 전 git 저장소를 만들고 원본을 `c577a07 before stage 1`로 커밋. `.gitignore` 추가(node_modules, dist, .env).
- 사용자 확인으로 **정기 휴무 = 매주 일요일**을 `business-facts.md`에 추가.
- 지번 주소 5곳 → 도로명 주소.
- 위치 섹션의 "추후 업데이트" 항목을 확정 값으로: 영업시간(월~토 09:30~20:00, 일요일 휴무), 전화(tel 링크), 주차 가능, 반려동물 동반 출입 가능. 지도·대중교통·길찾기는 미확인이라 숨김.
- 모의 예약 폼과 처리 코드 삭제 → 100% 예약제 안내 + 전화·카카오톡·인스타그램 버튼.
- 모바일 하단 고정 바를 **전화 / 카카오톡 문의** 두 버튼으로.
- 히어로에 **오픈 이벤트 배너**(2026.10.17~12.30, 버블 스파·탄산 스파·머드팩 중 1가지 선택). 자동 숨김 없음.
- 서비스에 스파 3종 추가(가격 "상담 후 안내").
- JSON-LD를 확정 값으로: `LocalBusiness`, 상호, 별칭 "포포", 도로명 주소, 전화, 월~토 영업시간, 카카오·인스타 sameAs.
- 매장 정보가 들어간 곳마다 `<!-- [매장정보] -->` 주석 표시.

### 2단계 — 고객 노출 문구 정리 · `d2a7b52`
- 후기 작성 기능 통째로 제거, 네이버 리뷰 버튼 자리는 주석으로 숨김(URL 미확정).
- 가격 안내를 "견종·체중·모량에 따라 상담 후 안내드립니다." 한 문장으로.
- FAQ 예약 답변을 실제 방법(100% 예약제, 전화·카카오톡)으로 교체.
- **미확정 취소 규정 FAQ 삭제** (당일 취소·노쇼·예약금 내용이 확정되지 않았음).
- "준비 중·추후 공개·모의 입력", AI 지시문처럼 읽히는 문장("임의 생성하지 않았습니다", "가짜 Before/After는…") 삭제.
- 본문 `POPO` → `PoPo`, 겹화살괄호 «» 섹션당 1회로 축소, 히어로·푸터에 "포포(PoPo)" 병기.

### 3단계 — 브랜드 디자인 · `545ad7b`
사용자 결정: 계획대로 진행 / 가짜 엠블럼 대신 텍스트 로고 / 제목 서체 Pretendard 통일.
- 색상을 `src/style.css`의 `:root` 토큰(`--popo-*`)에만 정의. CSS 규칙과 HTML에 hex 값 0개.
- 섹션 15개 → 7개: 히어로 → 소개 → 서비스·가격 → 첫 방문 → FAQ → 오시는 길 → 예약 안내.
  - 소개 섹션에 기존 소개·차별화·맞춤케어·PoPo CARE·케어 기록·케어 저니를 통합.
- 데스크톱·모바일 두 벌이던 메뉴를 한 벌(`#siteNav`)로.
- 히어로에 전화·카카오톡 버튼(카카오 버튼은 카카오 노란색).
- `theme-color` → `#FFFCF5`.
- 텍스트 대비 15개 조합 모두 WCAG AA(4.5:1) 이상 확인 — 최저 5.01:1.
- 데스크톱·모바일(390px) 화면 캡처로 레이아웃 확인.

### 4단계 — SEO · `6d3b586`
- title: "포포(PoPo)애견미용실 | 안양 관양동 애견미용 · 1:1 맞춤 그루밍"
- description 108자, canonical·og:url 추가, og:image 절대 URL, og:locale, 이미지 크기·alt.
- JSON-LD에 url·image 추가. schema.org에 애견미용 전용 타입이 없어 `LocalBusiness` 유지.
- `naver-site-verification` 자리는 주석으로(인증값 미발급).
- keywords 9개 → 5개.

### 5단계 — 독립 검토 · `ddd8d79`
- 1차 검토 🔴 1건: 히어로 일러스트 SVG 안에 "POPO QUIET CARE" 글자와 녹색이 남아 있었음 → 글자 삭제, 녹색을 브라운으로.
- 2차 검토: 🔴 없음.

### 후속 작업
| 커밋 | 내용 |
|---|---|
| `b74167b` | 안 쓰는 파일 삭제(`popo-logo.svg` 가짜 엠블럼, `popo-hero.jpg` 4.3MB), Pretendard CDN `@v1.3.9` 고정 |
| `2cc13f6` | 공유 이미지(`public/og-image.jpg`)를 크림 배경 + 상호 글자만 있는 1200×630 이미지로 교체 |
| `37de779` | **GitHub Pages 배포 설정**: Actions 워크플로, 빌드 base `/popo_petsalon/`, 주소들을 GitHub Pages로, `sitemap.xml` 추가 |
| `0b8a46d` | **Manus 정리**: `server/`, `admin.html`, `src/admin.js`, `Dockerfile`, `app.config.ts`, `manus-routes.json`, `check-api.mjs`, `ideas.md`, `plan.md` 삭제 |
| `f271e05` | 빈 커밋으로 배포 재실행 (Pages Source를 GitHub Actions로 바꾼 뒤) |

### 문서·스킬 정리 · `d2a4217` (2026-10-19 커밋)
- `progress.md` 작성(이 문서).
- popo-toolkit 스킬을 현재 구조에 맞게 갱신(v1.1.0): brand-guide에 실제 토큰 값·대비·로고 자리, copy-check에 SVG 속 글자 검사, seo-audit에 GitHub Pages·sitemap lastmod 규칙, update-info에 `[매장정보]` 검색과 함께 고칠 자리 목록, site-reviewer에 실행 환경.
- `/sync-docs` 스킬 추가(`.claude/skills/sync-docs/`): progress.md·스킬·CLAUDE.md·메모리를 한 번에 갱신.
- Claude 메모리: 한국어 보고 선호, git safe.directory·corepack 사용법, 사용자 작업 방식.

---

## 2026-10-19 — 구글 지도 추가

### 오시는 길에 구글 지도 · `04ef2fb`, `3b239bb`
- 사용자 요청: "가게 위치를 알 수 있도록 구글맵 활용, API 키 넣을 파일 작성".
- 방식: **Maps Embed API** iframe(무료·사용량 제한 없음, 코드 최소). 지도 검색어는 business-facts.md 도로명 주소에서 층·호를 뺀 "경기 안양시 동안구 관양로 145".
- 위치 표 아래에 지도 + "구글 지도에서 크게 보기" 링크(키 없이 동작하는 구글 지도 검색 URL). 모바일 4:3, 데스크톱 16:9, `loading="lazy"`.
- 키: `VITE_GOOGLE_MAPS_EMBED_KEY`. 로컬은 `.env.local`(gitignore, 견본 `.env.example`은 추적), 배포는 GitHub Secret `GOOGLE_MAPS_EMBED_KEY`를 `deploy.yml` 빌드 단계에서 넘긴다(사용자 승인 후 수정). **키가 없으면 지도 영역은 숨김.**
- Google Cloud: 키는 **My Maps Project** 소속, HTTP 리퍼러(`https://s73827-bit.github.io/*`, `http://localhost:3000/*`)와 Maps Embed API로 제한.
- 겪은 문제: ① 처음 키가 Embed API를 켜지 않은 프로젝트에 있어 403("API is not activated") → API를 켠 프로젝트에서 새 키 발급. ② Secret을 `VITE_` 접두어로 등록해 빌드에 키가 비어 있었음 → `GOOGLE_MAPS_EMBED_KEY`로 재등록. `3b239bb`는 재배포용 빈 커밋.
- 확인: 로컬·배포 사이트 모두 데스크톱/모바일(390px)에서 지도 표시, 콘솔 오류 없음.
- `.gitignore`에 `.playwright-mcp/`(브라우저 점검 캡처) 추가.
- `public/sitemap.xml` `lastmod` → 2026-10-19.

---

## 현재 구조

```
index.html               공개 페이지 전체 (매장 정보는 [매장정보] 주석으로 표시)
src/main.js              모바일 메뉴 토글, FAQ 아코디언, 구글 지도
src/style.css            :root 브랜드 토큰 + 전체 스타일
public/assets/popo-hero.svg   히어로 일러스트 (로고 원본이 오면 교체)
public/og-image.jpg      공유 이미지 1200×630
public/sitemap.xml       sitemap (lastmod 고정)
docs/business-facts.md   매장 사실 정보 (유일한 근거)
.env.example             구글 지도 키 견본 (.env.local로 복사해 키 입력, 커밋 안 됨)
.github/workflows/deploy.yml  main push → 빌드 → GitHub Pages (Secret GOOGLE_MAPS_EMBED_KEY 사용)
.claude/skills/popo-toolkit/  작업 스킬·검토 에이전트
```

### 배포 방법
1. `main` 브랜치에 push한다.
2. GitHub Actions "Deploy to GitHub Pages"가 `pnpm build` 후 `dist/`를 올린다(1분 안팎).
3. 저장소 Settings → Pages → Source는 **GitHub Actions**여야 한다("Deploy from a branch"로 두면 빌드 안 된 원본이 올라가 CSS가 깨진다).

### 로컬 작업
- `corepack pnpm install` → `corepack pnpm dev` (http://localhost:3000)
- 빌드 확인: `corepack pnpm build`
- 지도까지 보려면 `.env.example`을 `.env.local`로 복사하고 키를 넣는다(키 바꾼 뒤엔 dev 서버 재시작)
- 이 폴더는 다른 Windows 계정 소유라 git에 `-c safe.directory=C:/dev/popo_petsalon`가 필요하다. 한 번만 `git config --global --add safe.directory C:/dev/popo_petsalon`을 실행하면 이후 생략 가능.

### 브랜드 색상 토큰
| 토큰 | 값 | 용도 |
|---|---|---|
| `--popo-cream` | `#FFFCF5` | 페이지 배경 |
| `--popo-sand` | `#F6E5D3` | 섹션·카드 배경 |
| `--popo-beige` | `#E2CDBA` | 구분선 |
| `--popo-brown` | `#725E46` | 보조 텍스트·아이콘 |
| `--popo-brown-deep` | `#4A3A2A` (**임시값**) | 본문·제목·주요 버튼·푸터 |
| `--popo-kakao` | `#FEE500` | 카카오 버튼 전용 |

---

## 남은 일

### 사장님이 주셔야 할 정보 (`docs/business-facts.md`에 기록 → `/popo-toolkit:update-info`)
| 정보 | 쓰일 곳 |
|---|---|
| 로고 원본 파일 (PNG/SVG) | 헤더·히어로·파비콘·공유 이미지, `--popo-brown-deep` 재추출 |
| 네이버 플레이스 URL | 네이버 리뷰 버튼, 지도·길찾기, JSON-LD sameAs |
| 가격표 | 서비스·가격 섹션 |
| 예약 변경·취소 규정 | FAQ 복원 |
| 대표자명·사업자등록번호·동물미용업 등록번호 | 푸터 |
| 대중교통 안내 | 오시는 길 (지도는 2026-10-19 추가됨) |
| 실제 매장 사진 (리셉션, 원목 욕조) | 소개 섹션 |
| 자체 도메인 | canonical·OG·JSON-LD, robots.txt 추가, `vite.config.js` base를 `/`로 |

### 사장님 확인이 필요한 문구 (Manus 원본에서 가져온 운영 약속)
- "갑작스러운 현장 추가금 없이 상담 후 진행"
- "전체미용에 목욕·드라이·위생 기본 케어 포함", "항문낭 확인"
- "권장 미용 주기를 기록해 다음 방문 때 이어갑니다"
- "미용 시작 전 상세 내역을 투명하게 안내"
- 스파 카드 요약 문장("풍성한 거품으로…" 등)은 새로 쓴 문장

### 직접 하실 일
- [ ] 네이버 서치어드바이저 등록 → 인증값 전달 → sitemap 제출
- [ ] 구글 Search Console 등록 → sitemap 제출 (`https://s73827-bit.github.io/popo_petsalon/sitemap.xml`)
- [ ] 카카오 공유 디버거에서 새 주소 미리보기 확인
- [ ] Google Cloud **My First Project**에 남은 예전 지도 키 삭제 (오류 기록에 값이 노출됨)
- [ ] **2026-12-30 이후 오픈 이벤트 배너 삭제** (`index.html`의 OPEN EVENT 블록, `style.css`의 `.event-*`)

### 알려진 제약
- GitHub Pages 하위 경로(`/popo_petsalon/`)에서는 robots.txt를 쓸 수 없다(검색엔진은 도메인 최상위만 읽음). 자체 도메인 연결 후 추가.
- 파비콘 없음(로고 원본 대기).
- 구글 지도 키는 빌드된 JS에 공개된다(Embed API 구조상 불가피). 리퍼러·API 제한으로 보호하며, 키를 바꾸면 Secret 갱신 후 재배포해야 한다.
- 히어로 일러스트는 Manus가 그린 임시 그림을 브라운으로 바꾼 것. 로고 원본이 오면 교체.
