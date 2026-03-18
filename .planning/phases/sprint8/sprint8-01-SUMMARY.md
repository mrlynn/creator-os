---
phase: sprint8
plan: 01
subsystem: ui
tags: repurposing, clips, episodes, timestamps
requirements-completed: [REPURPOSE-01, REPURPOSE-02, REPURPOSE-03]
key-files:
  created: [src/app/api/episodes/from-clip/route.ts]
  modified: [src/lib/ai/repurposing-engine.ts, src/app/app/library/[id]/page.tsx]
---

# Sprint 8 Plan 01: Repurpose UX Summary

**Clip timestampRange, Create Episode from clip, Copy All Clips**

## Task Commits

1. **Task 1: Add timestampRange to ClipConcept** - `eace09d`
2. **Task 2–3: Create Episode from clip + Copy All Clips** - `668b676`

## Accomplishments

- Added `timestampRange?: { start, end }` to ClipConcept with MM:SS format
- POST /api/episodes/from-clip creates Script + Episode from clip
- Create Episode button per clip in Repurpose dialog
- Copy All Clips button with formatted export including timestamps

## Deviations

**1. [Rule 3 - Blocking] Fixed from-clip ideaId type extraction**
- Found during: Plan 02 build
- Issue: TypeScript error on parentEpisode.ideaId access
- Fix: Simplified to lean() and string extraction for ideaId
- Committed in: c823d30 (Plan 02 commit)
