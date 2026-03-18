---
phase: sprint9
plan: 06
subsystem: api
tags: youtube, tiktok, upload, googleapis, publishing

requires:
  - phase: sprint9-04
    provides: YouTube OAuth
  - phase: sprint9-05
    provides: TikTok OAuth
provides:
  - Episode videoUrl field
  - POST /api/episodes/[id]/upload
  - One-click upload to YouTube/TikTok (private)
  - Upload UI in Library and Pipeline
affects: []

tech-stack:
  added: googleapis
  patterns: Fetch video from URL, YouTube videos.insert, TikTok FILE_UPLOAD chunked

key-files:
  created: src/app/api/episodes/[id]/upload/route.ts
  modified: src/lib/db/models/Episode.ts, src/lib/db/schemas.ts, src/app/app/library/[id]/page.tsx, src/app/app/pipeline/page.tsx

key-decisions:
  - "videoUrl from episode or request body — user can save on episode or pass per-upload"
  - "YouTube: googleapis videos.insert with private status"
  - "TikTok: creator_info/query first, then init with FILE_UPLOAD, SELF_ONLY privacy"

requirements-completed: [UPLOAD-01]

duration: 25min
completed: 2026-03-18
---

# Phase Sprint 9 Plan 06: Upload Flow Summary

**Episode videoUrl, POST upload API for YouTube/TikTok (private), Library and Pipeline upload UI**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Episode model: optional videoUrl field
- UpdateEpisodeSchema: videoUrl optional
- POST /api/episodes/[id]/upload — body: { platform: youtube|tiktok, videoUrl? }
- YouTube: fetch video from URL, googleapis videos.insert (privacyStatus: private)
- TikTok: creator_info/query, init with FILE_UPLOAD, chunked PUT upload, SELF_ONLY
- PublishingRecord created on success, pushed to episode.publishingRecords
- Library [id]: Video URL input + Save, Upload to YouTube/TikTok when connected
- Pipeline: Upload YT / Upload TT buttons in card, dialog for videoUrl

## Task Commits

1. **Plan 06 (atomic)** - `e08a896` (feat: Upload flow)

## Files Created/Modified

- `src/lib/db/models/Episode.ts` - videoUrl field
- `src/lib/db/schemas.ts` - videoUrl in UpdateEpisodeSchema
- `src/app/api/episodes/[id]/upload/route.ts` - Upload API
- `src/app/app/library/[id]/page.tsx` - Upload section, videoUrl input, dialog
- `src/app/app/pipeline/page.tsx` - Upload YT/TT buttons, upload dialog
- `package.json`, `package-lock.json` - googleapis

## Decisions Made

- videoUrl from episode.videoUrl or body.videoUrl
- TikTok uses FILE_UPLOAD (PULL_FROM_URL requires URL ownership verification)
- SELF_ONLY privacy for TikTok (unaudited client safe)

## Deviations from Plan

None - plan executed as written.

## Next Phase Readiness

- Sprint 9 Phase 2 complete
- OAuth + upload flow ready for production use (with env config)
