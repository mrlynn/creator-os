---
phase: sprint9
plan: 04
subsystem: auth
tags: oauth, youtube, google, nextauth

requires:
  - phase: sprint9-03
    provides: PlatformConnection model, platform-connections API
provides:
  - YouTube OAuth connect flow
  - Settings page with Publishing connections
  - Connect/Disconnect YouTube UI
affects: sprint9-06

tech-stack:
  added: []
  patterns: Manual OAuth 2.0 flow (no googleapis), 503 when credentials missing

key-files:
  created: src/app/api/auth/youtube/connect/route.ts, src/app/api/auth/youtube/callback/route.ts, src/app/app/settings/page.tsx
  modified: src/components/shared-ui/AppSidebar.tsx

key-decisions:
  - "Manual OAuth flow (fetch) — no googleapis dependency"
  - "Connect returns 503 with clear message when GOOGLE_CLIENT_ID/SECRET not set"

requirements-completed: [YT-01]

duration: 8min
completed: 2026-03-18
---

# Phase Sprint 9 Plan 04: YouTube OAuth + Settings Page Summary

**YouTube OAuth connect flow with youtube.upload scope, token storage in PlatformConnection, and Settings page with Connect/Disconnect UI**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- GET /api/auth/youtube/connect — redirects to Google OAuth with youtube.upload scope
- GET /api/auth/youtube/callback — exchanges code for tokens, fetches channel info, upserts PlatformConnection
- Settings page: Publishing connections section, Connect YouTube button, status from GET /api/platform-connections, Disconnect → DELETE
- Settings nav item in AppSidebar (before Help)
- 503 with clear error when GOOGLE_CLIENT_ID/SECRET not configured

## Task Commits

1. **Plan 04 (atomic)** - `0d30c78` (feat: YouTube OAuth connect and Settings page)

## Files Created/Modified

- `src/app/api/auth/youtube/connect/route.ts` - OAuth initiation redirect
- `src/app/api/auth/youtube/callback/route.ts` - Token exchange, PlatformConnection upsert
- `src/app/app/settings/page.tsx` - Settings page with YouTube connect UI
- `src/components/shared-ui/AppSidebar.tsx` - Settings nav item

## Decisions Made

- Manual OAuth 2.0 flow (no googleapis package)
- Callback fetches channel info for platformUserId/platformUsername
- Redirect to /app/settings with query params for success/error

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- Ready for TikTok OAuth (plan 05)
