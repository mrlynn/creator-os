---
phase: sprint9
plan: 04
type: execute
wave: 2
depends_on:
  - "03"
files_modified:
  - src/app/api/auth/youtube/callback/route.ts
  - src/app/api/auth/youtube/connect/route.ts
  - src/app/app/settings/page.tsx
  - src/components/shared-ui/AppSidebar.tsx
autonomous: true
requirements:
  - YT-01
must_haves:
  truths:
    - "User can connect YouTube account via OAuth"
    - "Tokens stored in PlatformConnection"
  artifacts:
    - path: src/app/api/auth/youtube/connect/route.ts
      provides: "OAuth initiation"
    - path: src/app/api/auth/youtube/callback/route.ts
      provides: "OAuth callback, token storage"
  key_links:
    - from: "callback"
      to: "PlatformConnection"
      via: "create/update"
      pattern: "PlatformConnection"
user_setup:
  - service: google
    why: "YouTube OAuth"
    env_vars:
      - name: GOOGLE_CLIENT_ID
        source: "Google Cloud Console"
      - name: GOOGLE_CLIENT_SECRET
        source: "Google Cloud Console"
    dashboard_config:
      - task: "Enable YouTube Data API v3"
        location: "Google Cloud Console"
      - task: "Add redirect URI"
        location: "OAuth 2.0 Client"
---

<objective>
YouTube OAuth connect: Initiate OAuth, handle callback, store tokens in PlatformConnection.
Purpose: Enable YouTube upload (Phase 2).
Output: /api/auth/youtube/connect, /api/auth/youtube/callback, Settings UI to connect.
</objective>

<context>
@.planning/phases/sprint9/RESEARCH.md — Scope: youtube.upload. OAuth 2.0.
</context>

<tasks>

<task type="auto">
  <name>Task 1: YouTube OAuth routes</name>
  <files>src/app/api/auth/youtube/connect/route.ts, src/app/api/auth/youtube/callback/route.ts</files>
  <action>
1. GET /api/auth/youtube/connect — redirect to Google OAuth with scope youtube.upload
2. GET /api/auth/youtube/callback — exchange code for tokens, upsert PlatformConnection (userId from session, platform: youtube)
3. Use googleapis or manual OAuth flow
  </action>
  <verify>
    <automated>test -f src/app/api/auth/youtube/connect/route.ts && test -f src/app/api/auth/youtube/callback/route.ts && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>User can connect YouTube</done>
</task>

<task type="auto">
  <name>Task 2: Settings page and YouTube connect UI</name>
  <files>src/app/app/settings/page.tsx, src/components/shared-ui/AppSidebar.tsx</files>
  <action>
1. Create src/app/app/settings/page.tsx — Settings page with "Publishing connections" section
2. Add "Connect YouTube" button linking to /api/auth/youtube/connect
3. Fetch GET /api/platform-connections to show connected status for youtube
4. Add "Disconnect" button that calls DELETE /api/platform-connections?platform=youtube
5. Add Settings nav item to AppSidebar (SettingsIcon, href /app/settings) — insert before Help
  </action>
  <verify>
    <automated>test -f src/app/app/settings/page.tsx && grep -q "youtube" src/app/app/settings/page.tsx && grep -q "Settings" src/components/shared-ui/AppSidebar.tsx</automated>
  </verify>
  <done>Settings page exists, YouTube connect/disconnect works</done>
</task>

</tasks>

<verification>
- OAuth flow works
- Tokens stored in PlatformConnection
- Settings shows connect status
</verification>

<success_criteria>
- YouTube account connectable for publishing
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-04-SUMMARY.md`
</output>
