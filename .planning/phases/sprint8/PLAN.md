# Sprint 8: Creator Love — Repurpose, Calendar, Polish

**Phase:** sprint8  
**Source:** `.planning/phases/sprint8/RESEARCH.md`  
**Implementation order:** 1 → 2 → 3 → 4 → 5

**GSD plan files (for execute-phase):**
- `sprint8-01-PLAN.md` — Repurpose UX (Clip → Episode, timestamps, batch export)
- `sprint8-02-PLAN.md` — Calendar improvements (nav to episode, gap detection)
- `sprint8-03-PLAN.md` — Loading skeletons
- `sprint8-04-PLAN.md` — Keyboard shortcuts
- `sprint8-05-PLAN.md` — Voice-to-text capture

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | Repurpose UX | 01 | repurposing-engine.ts, library/[id]/page.tsx, /api/episodes |
| 2 | Calendar improvements | 02 | CalendarView.tsx, pipeline/page.tsx |
| 3 | Loading skeletons | 03 | ideas/page, scripts/page, pipeline/page, library/page |
| 4 | Keyboard shortcuts | 04 | scripts/[id]/page.tsx |
| 5 | Voice-to-text | 05 | ideas/new, ideas/[id] |

---

## Feature → Plan Mapping

| Requirement | Description | Plan |
|-------------|-------------|------|
| REPURPOSE-01 | Add timestampRange to ClipConcept + prompt | 01 |
| REPURPOSE-02 | "Create Episode" button per clip | 01 |
| REPURPOSE-03 | Batch export all clips (copy all) | 01 |
| CAL-01 | Event click → /app/library/[episodeId] | 02 |
| CAL-02 | Gap detection banner (optional) | 02 |
| SKELETON-01 | Skeleton for Ideas list | 03 |
| SKELETON-02 | Skeleton for Scripts list | 03 |
| SKELETON-03 | Skeleton for Pipeline Kanban | 03 |
| SKELETON-04 | Skeleton for Library list | 03 |
| KBD-01 | Cmd+S / Ctrl+S save script | 04 |
| KBD-02 | Cmd+Enter generate (Outline tab) | 04 |
| VOICE-01 | Web Speech API on idea form | 05 |

---

## Wave Structure

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 01, 02 | — |
| 2 | 03, 04 | — |
| 3 | 05 | — |

Plans 01–04 are independent. Plan 05 (voice) is independent.

---

## Implementation Order

1. **Plan 01** — Repurpose UX  
   - Commit: `feat(sprint8): repurpose UX — clip→episode, timestamps, batch export`

2. **Plan 02** — Calendar improvements  
   - Commit: `feat(sprint8): calendar — event click to episode, gap detection`

3. **Plan 03** — Loading skeletons  
   - Commit: `feat(sprint8): loading skeletons for ideas, scripts, pipeline, library`

4. **Plan 04** — Keyboard shortcuts  
   - Commit: `feat(sprint8): keyboard shortcuts — Cmd+S save, Cmd+Enter generate`

5. **Plan 05** — Voice-to-text  
   - Commit: `feat(sprint8): voice-to-text on idea capture`
