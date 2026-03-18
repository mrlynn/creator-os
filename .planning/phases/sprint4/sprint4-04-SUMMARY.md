---
phase: sprint4
plan: 04
subsystem: [api, analytics, ui]
tags: [heatmap, analytics, tags, material-ui]

requires: []
provides:
  - GET /api/analytics/heatmap
  - Topic Performance section on Analytics page
affects: [analytics]

tech-stack:
  added: []
  patterns: [aggregate by tag from AnalyticsSnapshot + Episode]

key-files:
  created:
    - src/app/api/analytics/heatmap/route.ts
  modified:
    - src/app/app/analytics/page.tsx

key-decisions:
  - "In-memory aggregation: fetch snapshots + episodes, group by tag"
  - "Engagement: (likes+comments+shares)/views or snapshot.engagement"

requirements-completed: [HEATMAP-01, HEATMAP-02]

duration: ~15min
completed: 2026-03-18
---

# Sprint 4 Plan 04: Topic Performance Heatmap — Summary

**GET /api/analytics/heatmap aggregates by tag; Topic Performance section on Analytics page with MUI Table.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 1

## Accomplishments

1. **Heatmap API** — aggregates viewCount, likeCount from snapshots by episode tags; returns byTag with totalViews, totalLikes, episodeCount, avgEngagement
2. **Analytics page** — Topic Performance section, MUI Table, empty state "Add tags to episodes for topic insights"

## Task Commits

1. **Tasks 1–2:** `bfe24cd` (feat: topic performance heatmap API and Analytics section)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript: ep._id type unknown in heatmap route — fixed with EpisodeLean interface
