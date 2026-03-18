# Sprint 9: Publishing Integrations — Plan

**Phase:** sprint9  
**Source:** `.planning/phases/sprint9/RESEARCH.md`  
**Implementation order:** 01 → 02 (Phase 1); 03–06 deferred (Phase 2)

**GSD plan files (for execute-phase):**
- `sprint9-01-PLAN.md` — Metadata export (Library episode detail)
- `sprint9-02-PLAN.md` — Metadata export (Pipeline card quick copy)
- `sprint9-03-PLAN.md` — PlatformConnection model (Phase 2)
- `sprint9-04-PLAN.md` — YouTube OAuth + Settings page (Phase 2)
- `sprint9-05-PLAN.md` — TikTok OAuth (Phase 2)
- `sprint9-06-PLAN.md` — Upload flow (Phase 2)

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | Metadata export (Library) | 01 | library/[id]/page.tsx |
| 2 | Metadata export (Pipeline) | 02 | pipeline/page.tsx |
| 3 | PlatformConnection model | 03 | models/PlatformConnection.ts |
| 4 | YouTube OAuth | 04 | OAuth routes, connection UI |
| 5 | TikTok OAuth | 05 | OAuth routes, connection UI |
| 6 | Upload flow | 06 | upload API, UI |

---

## Phase 1 (MVP) — Metadata Export

Zero API dependency. Copy/export title, description, tags for manual paste into Creator Studio.

| Requirement | Description | Plan |
|-------------|-------------|------|
| META-01 | Copy for YouTube (title, description, tags) | 01 |
| META-02 | Copy for TikTok (caption with hashtags) | 01 |
| META-03 | Copy as JSON (structured export) | 01 |
| META-04 | Pipeline card quick copy | 02 |

---

## Phase 2 (Deferred) — OAuth + Upload

| Requirement | Description | Plan |
|-------------|-------------|------|
| PC-01 | PlatformConnection model | 03 |
| YT-01 | YouTube OAuth connect | 04 |
| TT-01 | TikTok OAuth connect | 05 |
| UPLOAD-01 | Private upload flow | 06 |

---

## Wave Structure

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 01, 02 | — |
| 2 | 03 | — |
| 3 | 04 | 03 |
| 4 | 05 | 03, 04 |
| 5 | 06 | 04, 05 |

Phase 1: Plans 01–02 (complete).  
Phase 2: Plans 03–06 (sequential: 03 → 04 → 05 → 06). See `PHASE2-EXECUTION.md`.

---

## Implementation Order (Phase 1)

1. **Plan 01** — Metadata export (Library episode detail)  
   - Commit: `feat(sprint9): metadata export — copy for YouTube, TikTok, JSON`

2. **Plan 02** — Metadata export (Pipeline card)  
   - Commit: `feat(sprint9): pipeline card quick copy metadata`
