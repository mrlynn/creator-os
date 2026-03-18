---
phase: sprint6
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/evergreen-scorer.ts
  - src/lib/db/models/Episode.ts
  - src/lib/db/models/AiUsageLog.ts
  - src/app/api/episodes/[id]/evergreen/route.ts
  - src/app/app/library/[id]/page.tsx
autonomous: true
requirements:
  - EVER-01
  - EVER-02
must_haves:
  truths:
    - POST /api/episodes/[id]/evergreen returns evergreenScore 0–100, reasoning
    - Score persisted to Episode.aiMetadata
    - Episode detail page has "Score Evergreen" button
  artifacts:
    - path: src/lib/ai/evergreen-scorer.ts
      provides: scoreEvergreen(episode)
    - path: src/app/api/episodes/[id]/evergreen/route.ts
      provides: POST handler
    - path: src/lib/db/models/Episode.ts
      provides: aiMetadata.evergreenScore, evergreenReasoning
  key_links:
    - from: evergreen/route.ts
      to: repurpose/route.ts
      via: Episode fetch + script extraction
    - from: evergreen-scorer.ts
      to: usage-logger.ts
      via: logAiUsage({ category: 'evergreen-scoring' })
---

<objective>
Evergreen content scorer: GPT-4 rates content longevity 0–100; persist to Episode.aiMetadata.
Purpose: Surface repurposing candidates; topic stability and search intent.
Output: evergreen-scorer.ts, Episode schema aiMetadata, POST /api/episodes/[id]/evergreen, button.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@src/app/api/episodes/[id]/repurpose/route.ts
@src/lib/ai/virality-scorer.ts
@src/lib/db/models/Episode.ts
</context>

<interfaces>
From repurpose: Episode fetch with populate scriptId; script extraction
From virality-scorer: getOpenAIClient(), logAiUsage(), JSON parse, Zod validation
Episode: add aiMetadata subdocument with optional evergreenScore, evergreenReasoning
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add aiMetadata to Episode schema and evergreen-scoring category</name>
  <files>src/lib/db/models/Episode.ts, src/lib/db/models/AiUsageLog.ts</files>
  <action>
1. Episode: add aiMetadata to IEpisode interface and schema:
   aiMetadata?: { evergreenScore?: number; evergreenReasoning?: string }
   Use Schema.Types.Mixed or subdocument; optional
2. AiUsageLog: add 'evergreen-scoring' to category enum and IAiUsageLog type
  </action>
  <verify>npm run build</verify>
  <done>Episode has aiMetadata; AiUsageLog accepts evergreen-scoring</done>
</task>

<task type="auto">
  <name>Task 2: Create evergreen-scorer.ts</name>
  <files>src/lib/ai/evergreen-scorer.ts</files>
  <action>
1. Create src/lib/ai/evergreen-scorer.ts
2. Export async function scoreEvergreen(episode: { _id: string; title: string; scriptText?: string }): Promise&lt;{ success: true; evergreenScore: number; reasoning: string } | { success: false; error: string }&gt;
3. Build input: episode.title + (scriptText first 500 chars or '')
4. Prompt: Rate content longevity 0–100. Consider: topic stability (does it date quickly?), search intent (evergreen queries?), tutorial vs news.
5. Return JSON: { evergreenScore: number, reasoning: string }
6. Use response_format: { type: 'json_object' }, Zod validation
7. logAiUsage({ category: 'evergreen-scoring', tokensUsed, durationMs, success, relatedDocumentId, relatedDocumentType: 'Episode' })
  </action>
  <verify>npm run build</verify>
  <done>scoreEvergreen() returns { evergreenScore, reasoning }</done>
</task>

<task type="auto">
  <name>Task 3: Create POST /api/episodes/[id]/evergreen and add button</name>
  <files>src/app/api/episodes/[id]/evergreen/route.ts, src/app/app/library/[id]/page.tsx</files>
  <action>
1. Create POST /api/episodes/[id]/evergreen:
   - getServerSession, connectToDatabase, validate id
   - Episode.findById(id).populate('scriptId')
   - Extract scriptText (sections filter join); use title + scriptText first 500 chars
   - Call scoreEvergreen({ _id, title, scriptText })
   - On success: Episode.findByIdAndUpdate(id, { $set: { 'aiMetadata.evergreenScore': data.evergreenScore, 'aiMetadata.evergreenReasoning': data.reasoning } })
   - Return Response.json({ evergreenScore, reasoning })
2. Episode detail page: add "Score Evergreen" button, state (evergreenLoading, evergreenScore, evergreenReasoning)
3. On click: POST /api/episodes/{id}/evergreen; display score and reasoning
4. Use optional chaining for existing episodes (no aiMetadata)
  </action>
  <verify>curl -X POST /api/episodes/{id}/evergreen returns 200; button shows score</verify>
  <done>API persists score; button displays result</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/episodes/[id]/evergreen returns { evergreenScore, reasoning }
- Episode.aiMetadata updated; button shows score
</verification>

<success_criteria>
- Evergreen score 0–100 with reasoning
- Persisted to Episode
- evergreen-scoring category in AiUsageLog
</success_criteria>
