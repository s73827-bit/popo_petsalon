# POPO 공식 홈페이지 구현 계획

## 목표

경기도 안양시 동안구 관양동의 애견미용샵 **POPO**를 위해, 보호자가 “우리 아이를 맡겨도 괜찮겠다”는 신뢰를 느끼고 자연스럽게 예약 안내로 이동하는 모바일 우선 단일 페이지 공식 홈페이지를 만든다.

핵심 메시지는 **“예뻐지는 시간보다, 안심하는 시간을.”**이며, 모든 화면에서 “우리 아이가 편안해야 미용도 예뻐집니다.”라는 철학을 일관되게 전달한다.

## 제품 범위와 사용자 경험

- **인지:** 히어로와 POPO STORY에서 브랜드의 한 문장, 목적, 핵심 슬로건을 전달한다.
- **공감:** WHY POPO, CUSTOM GROOMING, POPO CARE에서 아이의 편안함을 우선하는 맞춤 접근을 설명한다.
- **신뢰:** 서비스, 첫 방문 흐름, 관리 기록 방향, 실제 자료 준비 상태를 통해 운영 원칙을 투명하게 보여준다.
- **확인:** 가격 안내, FAQ, 위치에서 확인된 정보와 미확정 정보를 명확히 구분한다.
- **행동:** 모든 주요 구간의 예약 CTA는 실제 예약 문의 입력 영역으로 연결하고, 제출된 문의는 관리자 대시보드에서 확인할 수 있도록 한다.

## 정보 구조

단일 스크롤 페이지의 섹션 앵커로 구성한다.

1. HOME / Hero
2. POPO STORY
3. WHY POPO
4. SERVICE
5. CUSTOM GROOMING
6. POPO CARE
7. GROOMING STORY (실제 자료 준비 중)
8. POPO REVIEW (실제 후기 준비 중)
9. POPO CARE RECORD
10. PRICE GUIDE
11. FIRST VISIT
12. POPO CARE JOURNEY
13. FAQ
14. LOCATION
15. RESERVATION

상단에는 브랜드 워드마크, 핵심 앵커 메뉴, 예약하기 버튼을 두고, 작은 화면에서는 토글형 메뉴를 사용한다. 화면 하단에는 모바일 전용 고정 예약 버튼을 제공한다.

## 콘텐츠·신뢰 원칙

- 확인된 주소는 **경기도 안양시 동안구 관양동 1455-11**만 표시한다.
- 가격, 전화번호, 영업시간, 주차, 대중교통, 고객 수, 자격·경력·보험·CCTV·의료·응급·인증·만족도·순위는 절대 임의로 만들지 않는다. 지도와 길찾기는 확인된 주소만 사용한다.
- 가격 영역은 **“가격표 준비 중 / 추후 업데이트”**로, 미확정 운영 정책은 **“운영 정책 확정 후 안내 예정”**으로 표시한다.
- GROOMING STORY와 POPO REVIEW에는 허위 사례·후기·Before/After를 넣지 않는다. 보호자가 제출하거나 관리자가 등록한 실제 자료만 공개 목록에 표시한다.
- 예약 입력 UI는 개인정보 처리 안내를 고지하고 실제 관리자 확인을 위한 문의로 저장한다. 카드 정보는 애플리케이션에 저장하지 않는다.

## 디자인 방향

- 스타일: 따뜻함 + 세련됨 + 전문성 + 편안함.
- 색감: 오트밀 크림 바탕, 차분한 세이지, 깊은 올리브, 살구색 포인트. 넓은 여백과 얇은 선, 부드러운 둥근 모서리로 안정감을 만든다.
- 구성: 불필요한 캐러셀·할인 배너·과도한 장식을 배제한 편집형 롱폼 레이아웃. 문장과 과정이 주인공이 되도록 설계한다.
- 시각 자산: 실제 고객 사례와 혼동되지 않는 비사실적 브랜드 일러스트 1장을 히어로에 사용하고, “브랜드 이미지 · 실제 고객 미용 사례가 아닙니다.”라고 표기한다. 프로젝트 전용 SVG 심볼을 헤더, 파비콘, 섹션 포인트에 재사용한다.

## 기술 구조

- **Vite 정적 프론트엔드 + Express API/컨테이너 + managed MySQL**로 확장한다. 리뷰, 케이스, 예약 문의와 관리자 인증은 서버에서 처리한다.
- `index.html`: 검색 가능한 초기 HTML, 시맨틱 섹션, 메타 태그, JSON-LD LocalBusiness 스키마(확인된 주소와 서비스 범위만 포함).
- `src/style.css`: 토큰, 반응형 레이아웃, 타이포그래피, 모션 감소 지원, 접근성 상태.
- `src/main.js`: 모바일 메뉴, FAQ 아코디언, 리뷰·케이스·지도 로딩, 예약 문의 API 제출을 담당한다.
- `public/manus-routes.json`: 공개 페이지, `/admin`, `/api/*`의 현재 라우팅 계약을 선언한다.
- `server/`: 데이터베이스, OAuth 인증, 파일 저장, Stripe webhook과 CRUD API를 담당한다.
- `public/`: 파비콘, 브랜드 심볼 및 히어로 자산을 둔다.

## SEO·접근성

- `<title>`, 설명, Open Graph 기본 정보, 자연스러운 안양·동안구·관양동·강아지 미용·애견미용·맞춤미용 관련 문구를 포함한다.
- 실제 공개 도메인이 아직 없으므로 내부·추측 URL을 canonical/`og:url`에 넣지 않는다.
- 구조화된 헤딩, `main`/`nav`/`section`/`footer`, 보이는 포커스, 키보드 조작 가능한 모바일 메뉴·FAQ, 충분한 대비, 적절한 `aria-*`를 적용한다.

## 배포 구조와 캐시

- **정적 프론트엔드 + 서버 API**를 선택한다. 공개 HTML/자산은 정적으로 제공하고, 리뷰·사진·예약·관리자·Stripe webhook은 서버와 영구 DB를 사용한다.
- Vite 빌드 결과는 `dist/`이며 `index.html`과 `/admin`용 `admin.html`을 포함한다.
- 배포 구성은 `pnpm install --frozen-lockfile && pnpm build`로 `dist`를 생성하도록 선언한다.
- 공개 정적 자산은 해시된 Vite 파일을 통해 장기 캐시하고, 루트와 관리자 HTML은 변경을 반영할 수 있도록 제공한다. `/api/*`와 `/admin`은 컨테이너 서버로 라우팅하고 동적 응답은 shared cache에서 제외한다.

## 검증 계획

- Vite 프로덕션 빌드와 정적 파일 구조를 점검한다.
- `/manus-routes.json`이 HTTP 200과 유효한 JSON 계약을 반환하는지 확인한다.
- 코드 기반으로 신뢰 원칙(가격·연락처·허위 후기·외부 예약 링크가 없음), 예약 폼 비전송 고지, SEO 메타, 반응형 CSS 및 접근성 상태를 검토한다.
- 계획 모드 요구사항에 따라 독립 검토를 수행하고 확인된 결함만 수정한다.


## 동적 기능 확장 계획 (2026-09-29)

### 목표 범위

기존 정적 홈페이지를 same-origin 동적 웹앱으로 확장한다.

1. **POPO REVIEW**: 별점(1~5), 텍스트, 사진 1장 업로드를 받는 작성 폼과 제출된 공개 리뷰 목록을 제공한다. 리뷰는 공개 즉시 노출하고 관리자 삭제가 가능하다.
2. **LOCATION**: 확인된 주소 `경기도 안양시 동안구 관양동 1455-11`을 Google Maps 플랫폼 프록시 기반의 실제 지도에 표시하고 길찾기 링크를 제공한다.
3. **/admin**: Manus OAuth로 인증된 허용 관리자 이메일(`s7382@bot.cue.im`)만 접근할 수 있는 대시보드에서 리뷰 삭제, 반려견 미용 케이스 스토리의 작성·수정·삭제, 예약 문의 조회·상태 변경을 제공한다.
4. **Stripe 준비**: 플랫폼 Stripe 샌드박스를 활성화하고 `/api/stripe/webhook` 계약과 결제 모듈 자리를 준비한다. 상품·가격·구독 조건은 사용자가 “나중에 등록”하기로 했으므로 임의의 상품/금액을 만들지 않으며, 상품이 등록되기 전에는 결제 버튼을 노출하지 않는다.

### 기술 구조

- `server/index.js`: Express 서버. 개발에서는 Vite middleware를 연결하고, 운영에서는 `dist/`를 정적 제공한다. `/api/*`를 동적 API로 분리한다.
- `server/db.js`: `DATABASE_URL` 기반 MySQL 연결, additive `schema_migrations`와 애플리케이션 테이블 초기화.
- `server/auth.js`: Manus OAuth 로그인 시작/콜백, `webdev_app_session` 쿠키와 `MANUS_JWT_SECRET` 검증, 관리자 이메일 allowlist 확인.
- `server/storage.js`: 서버에서 Manus Storage presign API를 호출해 리뷰·케이스 이미지 업로드를 위한 stable `/manus-storage/...` 주소를 저장한다. 브라우저에 private runtime key를 노출하지 않는다.
- `src/main.js`: 공개 리뷰 목록/제출, 지도 SDK 로딩, 로그인 상태 표시, 예약 문의 API 제출 및 관리자 링크를 연결한다.
- `src/admin.js`: `/admin` 전용 리뷰·케이스·예약 관리 UI와 상태 피드백을 제공한다.
- `admin.html`: 관리자 SPA shell. 공개 루트와 분리된 메타 정보 및 route entry를 갖는다.
- `public/manus-routes.json`: `/`, `/admin`, `/api/*`, `/api/stripe/webhook` 경로를 선언한다.
- `Dockerfile`: `pnpm install --frozen-lockfile`, `pnpm build`, `node server/index.js`를 포함하며 `PORT`를 따른다.

### 데이터 모델

- `reviews`: id, rating, text, author_name, image_url, created_at, deleted_at.
- `case_stories`: id, title, breed, before_text, after_text, before_image_url, after_image_url, care_note, created_at, updated_at, deleted_at.
- `reservations`: id, owner_name, phone, pet_name, breed, weight, service_type, style_request, pet_notes, preferred_date, preferred_time, status, created_at.
- `processed_stripe_events`: id, event_type, received_at. 카드번호·CVC·만료일·원본 webhook payload는 저장하지 않는다.

### 공개/비공개와 안전

- 리뷰 텍스트·파일명은 서버에서 검증하고 이미지 MIME/용량(최대 5MB)을 제한한다.
- 관리자 API는 Manus OAuth 세션과 이메일 allowlist를 모두 통과해야 한다.
- 예약 문의에는 `private, no-store`, 관리자 화면에도 민감한 연락처를 포함한다.
- Stripe webhook은 raw body 서명을 검증하고, 구독된 이벤트 중 미처리 이벤트도 2xx로 acknowledge한다. 상품이 없으므로 Checkout Session 생성 endpoint는 명시적으로 `409 catalog_not_configured`를 반환한다.
- 지도는 플랫폼 제공 browser key만 사용하고 주소·길찾기 목적지 URL은 검증된 주소에 한정한다.

### 배포와 라우팅

- static build는 `dist/`에 `index.html`과 `admin.html`을 생성한다.
- container deploy는 `/api/*`, `/api/stripe/webhook`, `/admin` 요청을 서버로 보내며, `/assets/*`는 immutable static, 나머지 공개 페이지는 static SPA fallback으로 제공한다.
- 동적 API와 예약 응답은 shared cache에 저장하지 않는다. 공개 리뷰 목록은 짧은 재검증만 허용하거나 no-cache로 유지한다.

### 검증

- 서버의 schema 초기화, 리뷰 CRUD, 이미지 presign 계약, 관리자 인증 분기, 예약 상태 변경, Stripe webhook 서명/중복 이벤트 처리를 코드 검사와 API 스모크 테스트로 확인한다.
- `pnpm build`와 `curl` 기반 health/API 응답을 확인한다.
- Plan Mode 확장에 따라 독립 validator가 공개/관리자 파트의 연결과 보안 경계를 재검토한다.


## 운영자 테스트 모드 변경

소유자의 즉시 테스트 요청에 따라 `/admin`과 관리자 API는 현재 `POPO_ADMIN_TEST_MODE`가 `false`가 아닌 동안 로그인 없이 열리는 테스트 모드로 동작한다. 화면에 공개 관리자 테스트 경고를 표시하고, 실제 운영 전에는 `POPO_ADMIN_TEST_MODE=false`로 되돌려 Manus OAuth 및 `s7382@bot.cue.im` allowlist 보호를 복구해야 한다.


## OAuth 복구

소유자의 후속 요청에 따라 `POPO_ADMIN_TEST_MODE=false`를 기본값 및 Docker 배포 환경에 적용해 Manus OAuth를 다시 활성화한다. 현재 관리자 인증은 Manus OAuth allowlist 방식이며 사이트 자체의 비밀번호/PIN 로그인은 구현되어 있지 않다. Manus OAuth 계정 비밀번호는 이 웹사이트에서 변경할 수 없으므로 별도 로컬 PIN 인증을 추가하려면 별도 인증 방식과 보호된 비밀값 설정이 필요하다.


## 옵트인 임시 PIN 테스트

`/admin?test=1`에서만 임시 PIN 입력 UI를 노출하고, `POPO_ADMIN_TEST_PIN` 보호 비밀값과 일치할 때 15분 만료의 별도 테스트 세션을 발급한다. 일반 `/admin`은 계속 Manus OAuth를 요구하며, `POPO_ADMIN_TEST_MODE=false`는 유지한다. PIN은 소스·Dockerfile·로그에 저장하지 않는다.
