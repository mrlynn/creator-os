---
phase: sprint8
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/repurposing-engine.ts
  - src/app/app/library/[id]/page.tsx
  - src/app/api/episodes/from-clip/route.ts
autonomous: true
requirements:
  - REPURPOSE-01
  - REPURPOSE-02
  - REPURPOSE-03
---

<objective>
Repurpose UX: Add timestampRange to clips, "Create Episode" per clip, batch export.
Purpose: Make repurposing first-class — creators can turn clips into episodes and export all at once.
</objective>

<context>
- ClipConcept in repurposing-engine.ts: clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone
- Library episode detail has Repurpose dialog; clips shown in Accordions
- POST /api/episodes creates episode (ideaId, scriptId, title, description, seriesId, profileId)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add timestampRange to ClipConcept</name>
  <files>src/lib/ai/repurposing-engine.ts</files>
  <action>
1. Add timestampRange?: { start: string; end: string } to ClipConcept (e.g. "2:30", "3:45")
2. Update system prompt to ask AI for approximate timestamps (start/end in MM:SS) for each clip based on script position
3. Parse and validate timestampRange in response
  </action>
  <verify>Repurpose returns clips with timestampRange when AI provides it</verify>
</task>

<task type="auto">
  <name>Task 2: Create Episode from clip</name>
  <files>src/app/api/episodes/from-clip/route.ts (new), src/app/app/library/[id]/page.tsx</files>
  <action>
1. Create POST /api/episodes/from-clip
   - Body: { parentEpisodeId: string, clip: { conceptTitle, newHook, script } }
   - Fetch parent episode (populate ideaId); validate
   - Create Script: ideaId from parent, title=clip.conceptTitle, outline=clip.script, hook=clip.newHook, status='draft'
   - Create Episode: ideaId, scriptId (new), title=clip.conceptTitle, description=clip.script
   - Return { episode } with new episode
2. In library/[id] Repurpose dialog: add "Create Episode" button per clip
3. On click: POST /api/episodes/from-clip, on success router.push('/app/library/[newId]') or /app/pipeline
  </action>
  <verify>Create Episode from clip creates script+episode, navigates to library</verify>
</task>

<task type="auto">
  <name>Task 3: Batch export all clips</name>
  <files>src/app/app/library/[id]/page.tsx</files>
  <action>
1. Add "Copy All Clips" button when clips.length > 0
2. On click: format all clips as single text (numbered, with hook, script, timestamp if present), copy to clipboard
3. Show Snackbar "Copied X clips to clipboard"
  </action>
  <verify>Copy All Clips copies formatted text for all clips</verify>
</task>

</tasks>

<verification>
- Clips include timestampRange when AI provides it
- Create Episode from clip creates episode and navigates
- Copy All Clips copies formatted text
</verification>
