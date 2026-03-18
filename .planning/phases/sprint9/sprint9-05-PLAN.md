---
phase: sprint9
plan: 05
type: execute
wave: 3
depends_on:
  - "03"
  - "04"
files_modified:
  - src/app/api/auth/tiktok/callback/route.ts
  - src/app/api/auth/tiktok/connect/route.ts
  - src/app/app/settings/page.tsx
autonomous: true
requirements:
  - TT-01
must_haves:
  truths:
    - "User can connect TikTok account via OAuth"
    - "Tokens stored in PlatformConnection"
  artifacts:
    - path: src/app/api/auth/tiktok/connect/route.ts
      provides: "OAuth initiation"
    - path: src/app/api/auth/tiktok/callback/route.ts
      provides: "OAuth callback, token storage"
  key_links:
    - from: "callback"
      to: "PlatformConnection"
      via: "create/update"
      pattern: "PlatformConnection"
user_setup:
  - service: tiktok
    why: "TikTok Content Posting API"
    env_vars:
      - name: TIKTOK_CLIENT_KEY
        source: "TikTok for Developers"
      - name: TIKTOK_CLIENT_SECRET
        source: "TikTok for Developers"
    dashboard_config:
      - task: "App review for Content Posting API"
        location: "TikTok for Developers"
---

<objective>
TikTok OAuth connect: Initiate OAuth, handle callback, store tokens in PlatformConnection.
Purpose: Enable TikTok upload (Phase 2).
Output: /api/auth/tiktok/connect, /api/auth/tiktok/callback, TikTok section added to existing Settings page.
</objective>

<context>
@.planning/phases/sprint9/RESEARCH.md — Scope: video.publish. OAuth 2.0 via TikTok Login Kit.
</context>

<tasks>

<task type="auto">
  <name>Task 1: TikTok OAuth routes</name>
  <files>src/app/api/auth/tiktok/connect/route.ts, src/app/api/auth/tiktok/callback/route.ts</files>
  <action>
1. GET /api/auth/tiktok/connect — redirect to TikTok OAuth with scope video.publish
2. GET /api/auth/tiktok/callback — exchange code for tokens, upsert PlatformConnection (userId from session, platform: tiktok)
3. Use TikTok OAuth 2.0 flow
  </action>
  <verify>
    <automated>test -f src/app/api/auth/tiktok/connect/route.ts && test -f src/app/api/auth/tiktok/callback/route.ts && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>User can connect TikTok</done>
</task>

<task type="auto">
  <name>Task 2: Add TikTok to Settings page</name>
  <files>src/app/app/settings/page.tsx</files>
  <action>
1. Add TikTok section to existing Settings page (same pattern as YouTube from plan 04)
2. Add "Connect TikTok" button linking to /api/auth/tiktok/connect
3. Show connected status from GET /api/platform-connections (filter platform=tiktok)
4. Add "Disconnect" calling DELETE /api/platform-connections?platform=tiktok
  </action>
  <verify>
    <automated>grep -q "tiktok" src/app/app/settings/page.tsx && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>TikTok connect/disconnect in Settings</done>
</task>

</tasks>

<verification>
- OAuth flow works
- Tokens stored in PlatformConnection
- Settings shows connect status
</verification>

<success_criteria>
- TikTok account connectable for publishing
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-05-SUMMARY.md`
</output>
