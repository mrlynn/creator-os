---
phase: sprint6
plan: 07
type: execute
wave: 1
depends_on:
  - sprint5-04
  - sprint6-06
files_modified:
  - src/app/api/ai/embed-batch/route.ts
  - src/lib/ai/embed-pipeline.ts
autonomous: true
requirements:
  - BATCH-01
must_haves:
  truths:
    - POST /api/ai/embed-batch processes documents missing embeddings
    - Returns { processed, failed, errors }
  artifacts:
    - path: src/app/api/ai/embed-batch/route.ts
      provides: POST handler
  key_links:
    - from: embed-batch/route.ts
      to: embed-pipeline.ts
      via: embedIdea, embedScript, embedEpisode
    - from: embed-batch/route.ts
      to: ContentIdea, Script, Episode
      via: find where embedding null/missing
---

<objective>
Batch embedding job: POST /api/ai/embed-batch — embed documents missing embeddings.
Purpose: Backfill embeddings; optional cron trigger.
Output: POST /api/ai/embed-batch with { types?, limit? }.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@.planning/phases/sprint6/sprint6-06-PLAN.md
@src/lib/ai/embed-pipeline.ts
@src/lib/db/models/ContentIdea.ts
@src/lib/db/models/Script.ts
@src/lib/db/models/Episode.ts
</context>

<interfaces>
Request body: { types?: ['idea','script','episode'], limit?: number } — default types all, limit 50
embed-pipeline: embedIdea(id), embedScript(id), embedEpisode(id)
Query: documents where embedding is null or missing. Use $or: [{ embedding: null }, { embedding: { $exists: false } }] or embedding: { $in: [null, []] }
Note: embedding has select: false; use .select('+embedding') when checking, or query without it (null/missing still matches)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create POST /api/ai/embed-batch</name>
  <files>src/app/api/ai/embed-batch/route.ts</files>
  <action>
1. Create src/app/api/ai/embed-batch/route.ts
2. getServerSession(); return 401 if unauthenticated
3. connectToDatabase()
4. Parse body with Zod: { types?: z.array(z.enum(['idea','script','episode'])), limit?: z.number().min(1).max(200) }
   - Default types = ['idea','script','episode']; default limit = 50
5. For each type, find documents missing embedding:
   - ContentIdea: find({ $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] }).limit(limit).select('_id')
   - Script: same pattern
   - Episode: same pattern
6. Process each document: call embedIdea(id) / embedScript(id) / embedEpisode(id)
7. Track: processed count, failed count, errors array (push error messages)
8. Process sequentially or in small batches to avoid rate limits; optional: process in parallel with concurrency limit
9. Return Response.json({ processed, failed, errors })
10. Import embedIdea, embedScript, embedEpisode from '@/lib/ai/embed-pipeline' (created in Plan 06)
  </action>
  <verify>curl -X POST /api/ai/embed-batch -d '{}' returns 200 with { processed, failed, errors }</verify>
  <done>Batch job processes missing embeddings</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/ai/embed-batch processes documents; returns counts
- Requires Sprint 5 embed routes; Plan 06 creates embed-pipeline (Plan 07 uses it)
</verification>

<success_criteria>
- types and limit configurable
- processed, failed, errors returned
- Documents with embedding populated after run
</success_criteria>
