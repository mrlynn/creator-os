---
phase: sprint4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/repurposing-engine.ts
  - src/app/api/episodes/[id]/repurpose/route.ts
  - src/app/app/library/[id]/page.tsx
autonomous: true
requirements:
  - REPURPOSE-01
  - REPURPOSE-02
must_haves:
  truths:
    - User can repurpose an episode into 4-6 TikTok clip concepts
    - Clips show conceptTitle, newHook, script, copyable content
  artifacts:
    - path: src/lib/ai/repurposing-engine.ts
      provides: generateClipConcepts(script, title, platform)
    - path: src/app/api/episodes/[id]/repurpose/route.ts
      provides: POST repurpose endpoint
    - path: src/app/app/library/[id]/page.tsx
      provides: Repurpose button and dialog
  key_links:
    - from: library/[id]/page.tsx
      to: /api/episodes/[id]/repurpose
      via: fetch POST
    - from: repurpose/route.ts
      to: repurposing-engine.ts
      via: generateClipConcepts
---

<objective>
Repurposing engine: YouTube script → 4-6 TikTok clip concepts with UI on episode detail.
Purpose: Enable content creators to turn one YouTube video into multiple short-form clips.
Output: repurposing-engine.ts, POST /api/episodes/[id]/repurpose, Repurpose button + dialog.
</objective>

<context>
@.planning/phases/sprint4/RESEARCH.md
@src/lib/ai/virality-scorer.ts
@src/lib/db/models/Script.ts
@src/app/app/library/[id]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Repurposing engine module</name>
  <files>src/lib/ai/repurposing-engine.ts</files>
  <action>
Create generateClipConcepts(script: string, title: string, platform?: string).
- Use getOpenAIClient() from @/lib/ai/openai-client.
- PRD Prompt 5 from RESEARCH.md: "You are a content repurposing specialist... Identify 4–6 self-contained moments... Return JSON array: { clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone }"
- response_format: { type: 'json_object' }
- Strip ```json markdown before JSON.parse if present.
- Return { success: true, clips } or { success: false, error }.
- logAiUsage({ category: 'repurposing' }) fire-and-forget.
- Truncate script to ~4000 chars if very long.
  </action>
  <verify>npm run build</verify>
  <done>generateClipConcepts returns structured clips from script input</done>
</task>

<task type="auto">
  <name>Task 2: Repurpose API route</name>
  <files>src/app/api/episodes/[id]/repurpose/route.ts</files>
  <action>
Create POST handler.
- getServerSession(), return 401 if unauthenticated.
- Validate params.id with Types.ObjectId.isValid.
- Episode.findById(id).populate('scriptId').
- Build script text: [script.hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n').
- If empty script return 400.
- Body: { platform?: string } default 'tiktok'.
- Call generateClipConcepts(scriptText, episode.title, platform).
- Return { clips } or { error } with 500.
  </action>
  <verify>curl -X POST /api/episodes/{id}/repurpose returns 200 with clips</verify>
  <done>API returns clip concepts for episode with script</done>
</task>

<task type="auto">
  <name>Task 3: Repurpose button on episode detail</name>
  <files>src/app/app/library/[id]/page.tsx</files>
  <action>
Add Repurpose Button (AutoAwesomeIcon) in Stack with View Script, Analytics.
- On click: open MUI Dialog.
- Dialog: POST /api/episodes/${id}/repurpose, optional platform select (tiktok default).
- Show loading, display clips (conceptTitle, newHook, script expandable, Copy per clip).
- Handle error state.
  </action>
  <verify>Visit /app/library/{id}, click Repurpose, see clips or error</verify>
  <done>User can repurpose episode and copy clip content</done>
</task>

</tasks>

<verification>
- npm run build passes
- Repurpose flow works on episode with script
</verification>

<success_criteria>
- Repurposing engine produces 4-6 clips
- API returns clips for valid episode
- Episode detail has Repurpose button and dialog
</success_criteria>
