---
phase: sprint9
plan: 05
subsystem: auth
tags: oauth, tiktok, nextauth

requires:
  - phase: sprint9-03
    provides: PlatformConnection model
  - phase: sprint9-04
    provides: Settings page pattern
provides:
  - TikTok OAuth connect flow
  - TikTok section on Settings page
affects: sprint9-06

tech-stack:
  added: []
  patterns: TikTok v2 auth URL, client_key/client_secret (not client_id)

key-files:
  created: src/app/api/auth/tiktok/connect/route.ts, src/app/api/auth/tiktok/callback/route.ts
  modified: src/app/app/settings/page.tsx

key-decisions:
  - "TikTok v2 auth URL: https://www.tiktok.com/v2/auth/authorize/"
  - "Token params: client_key, client_secret (TikTok naming)"

requirements-completed: [TT-01]

duration: 6min
completed: 2026-03-18
---

# Phase Sprint 9 Plan 05: TikTok OAuth Summary

**TikTok OAuth connect flow with video.publish scope, token storage in PlatformConnection, and TikTok section on Settings page**

## Performance

- **Duration:** ~6 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- GET /api/auth/tiktok/connect — redirects to TikTok v2 auth with video.publish scope
- GET /api/auth/tiktok/callback — exchanges code for tokens, upserts PlatformConnection (platformUserId from open_id)
- TikTok section on Settings page: Connect TikTok, Disconnect (same pattern as YouTube)
- 503 when TIKTOK_CLIENT_KEY/SECRET not configured

## Task Commits

1. **Plan 05 (atomic)** - `30f6f76` (feat: TikTok OAuth connect)

## Files Created/Modified

- `src/app/api/auth/tiktok/connect/route.ts` - OAuth initiation
- `src/app/api/auth/tiktok/callback/route.ts` - Token exchange, PlatformConnection upsert
- `src/app/app/settings/page.tsx` - TikTok section added

## Decisions Made

- TikTok v2 auth endpoint (v1 deprecated)
- State param for CSRF (crypto.randomBytes)
- platformUserId from open_id in token response

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- Ready for upload flow (plan 06)
