---
phase: sprint9
plan: 06
type: execute
wave: 4
depends_on:
  - "04"
  - "05"
files_modified:
  - src/lib/db/models/Episode.ts
  - src/lib/db/schemas.ts
  - src/app/api/episodes/[id]/upload/route.ts
  - src/app/app/library/[id]/page.tsx
  - src/app/app/pipeline/page.tsx
autonomous: true
requirements:
  - UPLOAD-01
must_haves:
  truths:
    - "User can upload episode to YouTube (private)"
    - "User can upload episode to TikTok (private)"
  artifacts:
    - path: src/app/api/episodes/[id]/upload/route.ts
      provides: "Upload API"
  key_links:
    - from: "upload API"
      to: "PlatformConnection"
      via: "fetch tokens"
      pattern: "PlatformConnection"
---

<objective>
Upload flow: Upload episode video to YouTube/TikTok via API (private-only, no audit).
Purpose: One-click publish to connected platforms.
Output: POST /api/episodes/[id]/upload, UI trigger from Library and Pipeline.
</objective>

<context>
@.planning/phases/sprint9/RESEARCH.md — YouTube: videos.insert, resumable upload. TikTok: Content Posting API Direct Post, FILE_UPLOAD (chunked). Both private-only without audit.
Episode model lacks videoUrl — add it in Task 1.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Episode videoUrl and Upload API</name>
  <files>src/lib/db/models/Episode.ts, src/lib/db/schemas.ts, src/app/api/episodes/[id]/upload/route.ts</files>
  <action>
1. Add optional videoUrl (string) to Episode model and Zod schema — URL to fetch video for upload
2. POST /api/episodes/[id]/upload — body: { platform: youtube | tiktok, videoUrl?: string }
3. Validate: episode.videoUrl or body.videoUrl required; return 400 if missing
4. Fetch PlatformConnection for session user + platform; 401 if not connected
5. YouTube: fetch video from URL, use googleapis videos.insert (resumable for large files). status.privacyStatus: "private"
6. TikTok: fetch video from URL, use Content Posting API v2/post/publish/video/init + chunked FILE_UPLOAD. privacy_level: "private"
7. On success: create PublishingRecord (episodeId, platform, status: "live", publishedUrl from response)
8. Use connectToDatabase(), getServerSession per project patterns
  </action>
  <verify>
    <automated>test -f src/app/api/episodes/[id]/upload/route.ts && grep -q "videoUrl" src/lib/db/models/Episode.ts && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Episode has videoUrl; upload API exists and creates PublishingRecord</done>
</task>

<task type="auto">
  <name>Task 2: Upload UI</name>
  <files>src/app/app/library/[id]/page.tsx, src/app/app/pipeline/page.tsx</files>
  <action>
1. Library: Add "Upload to YouTube" / "Upload to TikTok" when connected
2. Pipeline: Add upload option in Publish dialog or card
3. Show progress, success/error feedback
  </action>
  <verify>
    <automated>grep -q "upload" src/app/app/library/[id]/page.tsx && grep -q "upload" src/app/app/pipeline/page.tsx</automated>
  </verify>
  <done>Upload trigger in Library and Pipeline</done>
</task>

</tasks>

<verification>
- Upload API works for YouTube and TikTok
- UI triggers upload
- Private-only (no audit required)
</verification>

<success_criteria>
- One-click private upload to connected platforms
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-06-SUMMARY.md`
</output>
