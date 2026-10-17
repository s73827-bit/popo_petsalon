# 설치 방법

이 압축 파일 안의 내용을 **Manus 코드가 들어 있는 VS Code 프로젝트의 최상위 폴더**에 그대로 복사한다.

```
내-프로젝트/
├─ CLAUDE.md                          ← 프로젝트 지침 (Claude Code가 자동으로 읽음)
├─ docs/
│  ├─ business-facts.md               ← 매장 확정 정보 (유일한 근거 파일)
│  └─ prompts/PROMPTS.md              ← 단계별 작업 프롬프트
└─ .claude/
   ├─ settings.json                   ← 권한 설정 (빌드 명령 허용, .env 읽기 차단)
   └─ skills/popo-toolkit/            ← 플러그인
      ├─ .claude-plugin/plugin.json
      ├─ SKILL.md                     ← /popo-toolkit (도구 안내)
      ├─ skills/
      │  ├─ update-info/SKILL.md      ← /popo-toolkit:update-info
      │  ├─ copy-check/SKILL.md       ← /popo-toolkit:copy-check
      │  ├─ brand-guide/SKILL.md      ← /popo-toolkit:brand-guide
      │  └─ seo-audit/SKILL.md        ← /popo-toolkit:seo-audit
      └─ agents/site-reviewer.md      ← popo-toolkit:site-reviewer 에이전트
```

## 주의
- 프로젝트에 이미 `CLAUDE.md`나 `.claude/settings.json`이 있으면 덮어쓰지 말고 내용을 합친다.
- `.claude/skills/` 아래 `.claude-plugin/plugin.json`이 있는 폴더는 플러그인(`popo-toolkit@skills-dir`)으로 자동 로드된다. 단, **처음 프로젝트를 열 때 나오는 작업 폴더 신뢰(trust) 창을 수락**해야 한다.
- 복사 후 Claude Code 패널에서 `/popo-toolkit` 을 입력해 목록이 뜨면 정상이다. 안 뜨면 `/reload-plugins` 를 실행하거나 VS Code 창을 새로 고친다.
- 숨김 폴더(`.claude`)는 탐색기에서 안 보일 수 있다. VS Code 파일 탐색기에서는 보인다.

## 시작
`docs/prompts/PROMPTS.md`의 0단계 프롬프트부터 순서대로 실행한다.
