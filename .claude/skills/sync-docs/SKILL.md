---
name: sync-docs
description: 작업이 끝난 뒤 progress.md(작업 기록), popo-toolkit 스킬, CLAUDE.md, Claude 메모리를 실제 코드·커밋 상태에 맞게 한 번에 갱신한다.
argument-hint: "[이번에 특히 기록할 내용 (선택)]"
disable-model-invocation: true
---

# 문서·스킬·메모리 동기화

추가로 기록할 내용: $ARGUMENTS

모든 보고와 진행 설명은 한국어로 쓴다.
git 명령은 `git -c safe.directory=C:/dev/popo_petsalon …` 형태로 실행한다(폴더 소유자가 달라서 필요).

## 1. 무엇이 바뀌었는지 파악
1. `progress.md` 맨 위의 **"마지막 반영 커밋"** 값을 읽는다. 없으면 `progress.md`의 마지막 커밋 표를 기준으로 삼는다.
2. 그 커밋 이후의 기록을 본다: `git log --reverse --format="%h|%ad|%s" --date=short <마지막 반영 커밋>..HEAD`, `git diff --stat <마지막 반영 커밋>..HEAD`.
3. 커밋되지 않은 변경도 확인한다: `git status --short`.
4. 이번 대화에서 사용자가 내린 결정(확인해 준 사실, 고르라고 해서 고른 선택지, "하지 마"라고 한 것)을 정리한다. 커밋 메시지에 안 남는 정보라 여기서 놓치면 사라진다.
5. 바뀐 것이 없으면 "갱신할 내용 없음"이라고 보고하고 끝낸다.

## 2. progress.md 갱신
- 새 작업을 날짜별 섹션으로 추가한다(같은 날짜면 기존 섹션에 이어 쓴다). 커밋 해시, 무엇을 왜 바꿨는지, 사용자 결정을 적는다.
- "한눈에 보기", "현재 구조", "브랜드 색상 토큰" 표가 실제 파일과 맞는지 확인하고 고친다. 줄 수 같은 숫자는 `wc -l`로 다시 잰다.
- "남은 일": 해결된 항목은 지우거나 `[x]`로 바꾸고, 새로 생긴 항목을 추가한다. `docs/business-facts.md`의 TODO 목록과 맞춘다.
- 맨 위 **"마지막 반영 커밋"** 줄을 현재 `HEAD`의 짧은 해시로 바꾼다.
- 추측으로 쓰지 않는다. 확인한 커밋·파일·사용자 발언만 근거로 쓴다.

## 3. 스킬·CLAUDE.md 갱신
바뀐 내용이 아래 파일의 설명과 어긋나면 고친다. 어긋나지 않으면 건드리지 않는다.

| 이런 게 바뀌면 | 고칠 파일 |
|---|---|
| 매장 정보 위치, 반복되는 정보 자리, 배포 절차 | `.claude/skills/popo-toolkit/skills/update-info/SKILL.md` |
| 색상 토큰 값, 폰트, 로고·이미지, 섹션·메뉴 구성 | `.claude/skills/popo-toolkit/skills/brand-guide/SKILL.md` |
| 금지 문구 패턴, 새로 발견한 노출 실수 | `.claude/skills/popo-toolkit/skills/copy-check/SKILL.md` |
| 도메인, sitemap·robots, OG 이미지, 구조화 데이터 | `.claude/skills/popo-toolkit/skills/seo-audit/SKILL.md` |
| 빌드 명령, 검토 환경, 새 점검 항목 | `.claude/skills/popo-toolkit/agents/site-reviewer.md` |
| 스킬 목록·권장 순서 | `.claude/skills/popo-toolkit/SKILL.md` (+ `plugin.json` version을 한 단계 올림) |
| 스택·폴더 구조·명령어·배포 방식 | `CLAUDE.md` "2. 코드 환경" |
| 매장 사실 정보 | `docs/business-facts.md` — **사용자가 확인해 준 값만** 쓴다 |

검토(site-reviewer)에서 지적된 실수 유형이 있었다면, 다음에 같은 실수를 막을 수 있게 해당 스킬의 점검 항목에 한 줄 추가한다.

## 4. 메모리 갱신
메모리 폴더: `C:\Users\s7382\.claude\projects\C--dev-popo-petsalon\memory\` (색인은 `MEMORY.md`).
- 저장할 것: 사용자 선호·피드백(작업 방식에 대한 지시와 그 이유), 저장소에 남지 않는 프로젝트 사정(마감, 외부 사정, 환경 문제), 외부 자료 위치.
- 저장하지 않을 것: 코드 구조, 커밋 내역, `progress.md`·`CLAUDE.md`에 이미 있는 내용.
- 새 메모리를 만들기 전에 기존 파일을 읽고, 같은 주제면 그 파일을 고친다. 틀린 메모리는 지운다.
- 파일 하나에 사실 하나, frontmatter(name, description, metadata.type) 형식을 지키고 `MEMORY.md`에 한 줄 색인을 추가한다.

## 5. 마무리
- 코드를 건드리지 않았으면 빌드는 생략한다. 스킬 외 파일(`index.html` 등)을 고쳤다면 `corepack pnpm build`로 확인한다.
- 바꾼 파일과 요지를 표로 보고한다(progress.md / 스킬 / CLAUDE.md / 메모리 각각).
- 커밋·push는 사용자에게 물어보고 한다. `main`에 push하면 GitHub Pages 배포가 자동으로 돈다(문서만 바뀌어도 배포 작업은 실행된다).
