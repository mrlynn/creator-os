---
phase: sprint2
plan: sprint2
subsystem: [content, analytics, ui, api, ai]
tags: [fullcalendar, virality, analytics, audience-calibration, mongodb, nextjs, material-ui]

# Dependency graph
requires: []
provides:
  - Virality scoring on idea create + manual Score button
  - Analytics CRUD API and page with form + list
  - Audience calibration toggle and rewrite in Script Studio
  - Publishing calendar with FullCalendar in Pipeline
affects: [ideas, scripts, pipeline, analytics]

# Tech tracking
tech-stack:
  added: [@fullcalendar/core, @fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/list]
  patterns: [fire-and-forget AI, Zod schemas, connectToDatabase, getServerSession]

key-files:
  created:
    - src/lib/ai/virality-scorer.ts
    - src/app/api/ideas/[id]/score/route.ts
    - src/app/api/analytics-snapshots/route.ts
    - src/app/api/analytics-snapshots/[id]/route.ts
    - src/app/api/scripts/[id]/rewrite/route.ts
    - src/app/api/calendar/route.ts
    - src/app/app/analytics/page.tsx
    - src/components/pipeline/CalendarView.tsx
  modified:
    - src/app/api/ideas/route.ts
    - src/app/app/ideas/[id]/page.tsx
    - src/components/shared-ui/AppSidebar.tsx
    - src/lib/db/schemas.ts
    - src/app/app/scripts/[id]/page.tsx
    - src/app/app/pipeline/page.tsx

key-decisions:
  - "Virality: fire-and-forget on create + manual Score button for retry"
  - "Audience toggle: Beginner/Advanced only; default from idea.audience"
  - "Calendar: full-day events; eventClick navigates to Pipeline"
  - "Analytics: clickThroughRate optional in Create schema"

patterns-established:
  - "Fire-and-forget AI: void scoreVirality(...).then(...).catch(console.error)"
  - "FullCalendar: dynamic import with ssr: false for client-only"

requirements-completed: []

# Metrics
duration: ~45min
completed: 2026-03-18
---

# Sprint 2: Publishing Calendar, Audience Calibration, Virality Score, Analytics — Summary

**Four features delivered: virality scoring on idea create + manual Score, analytics CRUD + page, audience calibration rewrite + toggle, publishing calendar with FullCalendar in Pipeline.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 4 features
- **Files created:** 8
- **Files modified:** 6

## Accomplishments

1. **Virality Score** — GPT-4 virality scorer (0–100 + reasoning), fire-and-forget on idea create, manual Score button on idea detail
2. **Analytics Page** — CRUD API for analytics snapshots, form + list, sidebar enabled
3. **Audience Calibration** — POST /api/scripts/[id]/rewrite, Beginner/Advanced toggle in Script Studio, default from idea.audience
4. **Publishing Calendar** — GET /api/calendar, FullCalendar in Pipeline (Kanban | Calendar tabs)

## Task Commits

1. **Feature 1: Virality Score** — `575ee2b` (feat)
2. **Feature 2: Analytics Page** — `545a891` (feat)
3. **Feature 3: Audience Calibration** — `cb8b95d` (feat)
4. **Feature 4: Publishing Calendar** — `d45c529` (feat)

## Files Created/Modified

- `src/lib/ai/virality-scorer.ts` — GPT-4 virality scoring with logAiUsage
- `src/app/api/ideas/[id]/score/route.ts` — Manual virality score endpoint
- `src/app/api/ideas/route.ts` — Fire-and-forget scoring after create
- `src/app/app/ideas/[id]/page.tsx` — Score button, viralityReasoning display
- `src/app/api/analytics-snapshots/route.ts` — GET/POST
- `src/app/api/analytics-snapshots/[id]/route.ts` — GET/PUT/DELETE
- `src/app/app/analytics/page.tsx` — Form + list, episode selector
- `src/components/shared-ui/AppSidebar.tsx` — Analytics enabled
- `src/lib/db/schemas.ts` — Add RewriteScriptSchema, UpdateAnalyticsSnapshotSchema, clickThroughRate
- `src/app/api/scripts/[id]/rewrite/route.ts` — Audience rewrite with generateScriptFromOutline
- `src/app/app/scripts/[id]/page.tsx` — Toggle, rewrite button, audience in generate
- `src/app/api/calendar/route.ts` — Events from PublishingRecord
- `src/components/pipeline/CalendarView.tsx` — FullCalendar month + list
- `src/app/app/pipeline/page.tsx` — Kanban | Calendar tabs

## Decisions Made

- Virality: fire-and-forget on create + manual Score button (recommended in RESEARCH)
- Audience: Beginner/Advanced only; map "mixed"/"intermediate" to beginner
- Calendar: eventClick navigates to Pipeline (no episode detail page yet)
- Analytics: clickThroughRate optional in Create schema per model

## Deviations from Plan

None — plan executed as specified per RESEARCH.md.

## Issues Encountered

- TypeScript: POST ideas handler `.then()` callback needed explicit `return undefined` for non-success path
- FullCalendar: eventClick handler type mismatch — simplified to `() => router.push('/app/pipeline')`
- AppSidebar: nav item type needed optional `disabled` after removing Analytics disabled

## Self-Check: PASSED

- All created files exist
- Commits 575ee2b, 545a891, cb8b95d, d45c529 present
- Build passes

---
*Phase: sprint2*
*Completed: 2026-03-18*
