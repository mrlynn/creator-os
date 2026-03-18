# Sprint 8: Creator Love — Research

**Source:** Strategic recommendations for making Creator OS a tool creators love using.

## Current State (2026-03-18)

- **Repurpose:** API exists (`POST /api/episodes/[id]/repurpose`), UI in library/[id] dialog. ClipConcept: clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone. No timestamp. No "Create Episode from clip."
- **Calendar:** CalendarView exists, FullCalendar, /api/calendar. Events from PublishingRecords. Event click currently goes to /app/pipeline; should go to episode detail.
- **Loading:** No skeletons on Ideas, Scripts, Pipeline, Library list views.
- **Keyboard shortcuts:** None on script editor.
- **Voice capture:** Not implemented.
- **Publishing:** No YouTube/TikTok API integration; manual record entry only.

## Prioritized Features

| # | Feature | Domain | Effort | Impact |
|---|---------|--------|--------|--------|
| 1 | Repurpose UX (Clip → Episode, timestamps, batch export) | Content Library | Medium | High |
| 2 | Calendar improvements (nav to episode, gap detection) | Pipeline | Small | Medium |
| 3 | Loading skeletons | UX | Small | Medium |
| 4 | Keyboard shortcuts | Script Studio | Small | Medium |
| 5 | Voice-to-text capture | Idea Bank | Small | Medium |
| 6 | Publishing integrations (YouTube, TikTok) | Pipeline | Large | Very High |

## Plan Mapping

| Plan | Feature | Files |
|------|---------|-------|
| 01 | Repurpose UX | repurposing-engine.ts, library/[id]/page.tsx, POST /api/episodes |
| 02 | Calendar improvements | CalendarView.tsx, pipeline/page.tsx |
| 03 | Loading skeletons | ideas/page, scripts/page, pipeline/page, library/page |
| 04 | Keyboard shortcuts | scripts/[id]/page.tsx |
| 05 | Voice-to-text | ideas/new/page, ideas/[id]/page (quick capture) |

## Out of Scope (Sprint 9+)

- Publishing API integrations (YouTube, TikTok) — research phase first
- Browser extension
- PWA / mobile capture
