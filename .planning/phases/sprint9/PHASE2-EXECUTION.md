# Sprint 9 Phase 2: OAuth + Upload — Execution Guide

**Status:** Ready for execution  
**Plans:** 03 → 04 → 05 → 06 (sequential waves)

---

## Wave Structure

| Wave | Plan | Depends On | Autonomous |
|------|------|------------|------------|
| 1 | sprint9-03 | — | yes |
| 2 | sprint9-04 | 03 | yes |
| 3 | sprint9-05 | 03, 04 | yes |
| 4 | sprint9-06 | 04, 05 | yes |

**Why sequential (04 → 05):** Plans 04 and 05 both modify `src/app/app/settings/page.tsx`. Plan 04 creates the Settings page with YouTube; Plan 05 adds TikTok to the same page. Running in parallel would cause file conflicts.

---

## Execution Order

1. **Plan 03** — PlatformConnection model + CRUD API  
   - Creates foundation for OAuth token storage

2. **Plan 04** — YouTube OAuth + Settings page  
   - Creates Settings page (new), adds sidebar link, YouTube connect/disconnect

3. **Plan 05** — TikTok OAuth  
   - Adds TikTok section to existing Settings page

4. **Plan 06** — Upload flow  
   - Adds videoUrl to Episode, upload API, UI triggers in Library and Pipeline

---

## User Setup (Before Execution)

### Plan 04 (YouTube)
- **Google Cloud Console:** Create OAuth 2.0 credentials
- **Env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Enable:** YouTube Data API v3
- **Redirect URI:** `{NEXTAUTH_URL}/api/auth/youtube/callback`

### Plan 05 (TikTok)
- **TikTok for Developers:** Create app, request Content Posting API
- **Env vars:** `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
- **Redirect URI:** `{NEXTAUTH_URL}/api/auth/tiktok/callback`
- **Note:** App review required; private-only works for unaudited apps

---

## Key Decisions (Locked)

- **PlatformConnection:** Custom MongoDB model, not NextAuth Account
- **Private-only:** No audit required for MVP; users can change visibility in Creator Studio
- **Episode videoUrl:** Added in Plan 06; upload API fetches from URL
- **Settings page:** Created in Plan 04; Plan 05 extends it

---

## Verification Checklist

- [ ] Plan 03: PlatformConnection model exists, API returns connections
- [ ] Plan 04: OAuth flow works, Settings page shows YouTube connect
- [ ] Plan 05: TikTok connect in Settings
- [ ] Plan 06: Upload API works, UI triggers in Library and Pipeline

---

## Execute

```bash
/gsd:execute-phase sprint9 --plans 03,04,05,06
```

Or execute plan-by-plan: 03 → 04 → 05 → 06.
