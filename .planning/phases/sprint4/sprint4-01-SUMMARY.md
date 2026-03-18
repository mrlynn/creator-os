---
phase: sprint4
plan: 01
subsystem: [ai, api, ui]
tags: [repurposing, openai, tiktok, material-ui]

requires: []
provides:
  - generateClipConcepts() in repurposing-engine.ts
  - POST /api/episodes/[id]/repurpose
  - Repurpose button and dialog on episode detail
affects: [library, episodes]

tech-stack:
  added: []
  patterns: [getOpenAIClient, logAiUsage repurposing category, response_format json_object]

key-files:
  created:
    - src/lib/ai/repurposing-engine.ts
    - src/app/api/episodes/[id]/repurpose/route.ts
  modified:
    - src/app/app/library/[id]/page.tsx

key-decisions:
  - "Truncate script to 4000 chars for GPT context"
  - "Strip ```json markdown before JSON.parse"

requirements-completed: [REPURPOSE-01, REPURPOSE-02]

duration: ~15min
completed: 2026-03-18
---

# Sprint 4 Plan 01: Repurposing Engine — Summary

**YouTube script → 4-6 TikTok clip concepts via GPT-4, with Repurpose button and dialog on episode detail.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

1. **Repurposing engine** — generateClipConcepts(script, title, platform) with PRD Prompt 5
2. **Repurpose API** — POST /api/episodes/[id]/repurpose, builds script from populated scriptId
3. **Episode detail UI** — Repurpose button, dialog with platform select, clips with Copy per clip

## Task Commits

1. **Tasks 1–3:** `5cbedb4` (feat: repurposing engine, API, Repurpose button)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None
