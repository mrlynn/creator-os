---
phase: sprint5
plan: 04
type: execute
wave: 2
depends_on:
  - sprint5-02
files_modified:
  - src/app/api/ideas/[id]/embed/route.ts
  - src/app/api/scripts/[id]/embed/route.ts
  - src/app/api/episodes/[id]/embed/route.ts
autonomous: true
requirements:
  - VEC-04
must_haves:
  truths:
    - POST /api/ideas/[id]/embed stores embedding on ContentIdea
    - POST /api/scripts/[id]/embed stores embedding on Script
    - POST /api/episodes/[id]/embed stores embedding on Episode
  artifacts:
    - path: src/app/api/ideas/[id]/embed/route.ts
      provides: POST embed for ContentIdea
    - path: src/app/api/scripts/[id]/embed/route.ts
      provides: POST embed for Script
    - path: src/app/api/episodes/[id]/embed/route.ts
      provides: POST embed for Episode
  key_links:
    - from: ideas/[id]/embed/route.ts
      to: embeddings.ts
      via: embed(text)
    - from: ideas/[id]/embed/route.ts
      to: ContentIdea
      via: findByIdAndUpdate with embedding
---

<objective>
Embed API routes: POST /api/ideas|[scripts]|[episodes]/[id]/embed — build text, call Voyage embed, save.
Purpose: Populate embedding field for semantic search; manual or future batch trigger.
Output: Three embed routes following repurpose/auto-tagger text extraction patterns.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
@src/app/api/episodes/[id]/repurpose/route.ts
@src/lib/ai/auto-tagger.ts
@src/lib/ai/embeddings.ts
@src/lib/db/models/ContentIdea.ts
@src/lib/db/models/Script.ts
@src/lib/db/models/Episode.ts
</context>

<interfaces>
From repurpose route: getServerSession(), connectToDatabase(), Types.ObjectId.isValid
From auto-tagger: sections = [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')
From embeddings: embed(text, { inputType?: 'query'|'document' })
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: POST /api/ideas/[id]/embed</name>
  <files>src/app/api/ideas/[id]/embed/route.ts</files>
  <action>
Create POST handler.
1. getServerSession(); return 401 if !session?.user?.email
2. connectToDatabase()
3. Validate params.id with Types.ObjectId.isValid; return 400 if invalid
4. ContentIdea.findById(params.id); return 404 if not found
5. Build text: `${idea.title}\n\n${idea.description}`.trim()
6. If !text: return 400 "Idea has no content"
7. Truncate to ~8000 chars if needed
8. embedding = await embed(text)
9. ContentIdea.findByIdAndUpdate(id, { $set: { embedding } })
10. Return Response.json({ success: true })
11. logAiUsage with relatedDocumentId, relatedDocumentType: 'ContentIdea' (in embed() already; add if needed)
</action>
  <verify>curl -X POST /api/ideas/{id}/embed returns 200; document has embedding in DB</verify>
  <done>ContentIdea embed route works</done>
</task>

<task type="auto">
  <name>Task 2: POST /api/scripts/[id]/embed</name>
  <files>src/app/api/scripts/[id]/embed/route.ts</files>
  <action>
Create POST handler.
1. getServerSession(); return 401 if unauthenticated
2. connectToDatabase()
3. Validate params.id; return 400 if invalid
4. Script.findById(params.id); return 404 if not found
5. Build text: [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro].filter(Boolean).join('\n\n')
6. Prepend title: `${script.title}\n\n${scriptText}`.trim()
7. If !text: return 400 "Script has no content"
8. Truncate to ~8000 chars
9. embedding = await embed(text)
10. Script.findByIdAndUpdate(id, { $set: { embedding } })
11. Return Response.json({ success: true })
</action>
  <verify>curl -X POST /api/scripts/{id}/embed returns 200</verify>
  <done>Script embed route works</done>
</task>

<task type="auto">
  <name>Task 3: POST /api/episodes/[id]/embed</name>
  <files>src/app/api/episodes/[id]/embed/route.ts</files>
  <action>
Create POST handler.
1. getServerSession(); return 401 if unauthenticated
2. connectToDatabase()
3. Validate params.id; return 400 if invalid
4. Episode.findById(params.id).populate('scriptId'); return 404 if not found
5. script = episode.scriptId (populated)
6. Build scriptText: [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')
7. fullText = `${episode.title}\n\n${episode.description || ''}\n\n${scriptText}`.trim()
8. If !fullText: return 400 "Episode has no content"
9. Truncate to ~8000 chars
10. embedding = await embed(fullText)
11. Episode.findByIdAndUpdate(id, { $set: { embedding } })
12. Return Response.json({ success: true })
</action>
  <verify>curl -X POST /api/episodes/{id}/embed returns 200</verify>
  <done>Episode embed route works</done>
</task>

</tasks>

<verification>
- npm run build passes
- All three embed routes return 200 for valid documents
</verification>

<success_criteria>
- Ideas, scripts, episodes can be embedded via POST
- Text extraction matches auto-tagger/repurposing-engine pattern
</success_criteria>
