---
phase: sprint9
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/db/models/PlatformConnection.ts
  - src/lib/db/schemas.ts
  - src/lib/db/models/index.ts
  - src/app/api/platform-connections/route.ts
autonomous: true
requirements:
  - PC-01
must_haves:
  truths:
    - "PlatformConnection model stores OAuth tokens per user per platform"
    - "API supports CRUD for platform connections"
  artifacts:
    - path: src/lib/db/models/PlatformConnection.ts
      provides: "PlatformConnection model"
  key_links:
    - from: "PlatformConnection"
      to: "User (NextAuth)"
      via: "userId"
      pattern: "userId"
---

<objective>
PlatformConnection model: MongoDB collection for YouTube/TikTok OAuth tokens.
Purpose: Store platform-specific tokens separate from NextAuth (publishing connections, not sign-in).
Output: PlatformConnection model, Zod schema, CRUD API.
</objective>

<context>
@.planning/phases/sprint9/RESEARCH.md — Recommends custom PlatformConnection (not NextAuth Account).
Schema: userId, platform (youtube|tiktok), accessToken, refreshToken, expiresAt, platformUserId, platformUsername.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PlatformConnection model</name>
  <files>src/lib/db/models/PlatformConnection.ts, src/lib/db/schemas.ts, src/lib/db/models/index.ts</files>
  <action>
1. Create PlatformConnection Mongoose model: userId (ObjectId), platform (enum: youtube, tiktok), accessToken (String), refreshToken (String), expiresAt (Date), platformUserId (String), platformUsername (String, optional)
2. Add Zod schema for create/update validation
3. Export from models/index.ts
4. Use connectToDatabase from @/lib/db/connection
  </action>
  <verify>
    <automated>npm run build 2>&1 | head -20</automated>
  </verify>
  <done>PlatformConnection model exists and is exported</done>
</task>

<task type="auto">
  <name>Task 2: Platform connections API</name>
  <files>src/app/api/platform-connections/route.ts</files>
  <action>
1. GET /api/platform-connections — list connections for session user (filter by userId)
2. DELETE /api/platform-connections?platform=youtube — remove connection
3. Auth: getServerSession, require session
  </action>
  <verify>
    <automated>test -f src/app/api/platform-connections/route.ts && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>API supports list and delete</done>
</task>

</tasks>

<verification>
- PlatformConnection model created
- API returns connections for authenticated user
</verification>

<success_criteria>
- OAuth tokens can be stored per user per platform
- Ready for OAuth flow plans (04, 05)
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-03-SUMMARY.md`
</output>
