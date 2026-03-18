---
phase: sprint5
plan: 05
type: execute
wave: 2
depends_on:
  - sprint5-02
  - sprint5-03
files_modified:
  - src/app/api/ai/search/route.ts
autonomous: true
requirements:
  - VEC-05
must_haves:
  truths:
    - POST /api/ai/search returns ideas, episodes, scripts by semantic similarity
    - Query is embedded with inputType 'query'; $vectorSearch runs on each collection
  artifacts:
    - path: src/app/api/ai/search/route.ts
      provides: POST semantic search
  key_links:
    - from: search/route.ts
      to: embeddings.ts
      via: embed(query, { inputType: 'query' })
    - from: search/route.ts
      to: ContentIdea, Episode, Script
      via: $vectorSearch aggregation
---

<objective>
Semantic search API: POST /api/ai/search — embed query, run $vectorSearch on contentideas, episodes, scripts, return merged results.
Purpose: Enable semantic search across content library.
Output: POST /api/ai/search with { query, types?, limit? }.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
@src/lib/ai/embeddings.ts
@src/lib/db/models/ContentIdea.ts
@src/lib/db/models/Script.ts
@src/lib/db/models/Episode.ts
@docs/runbook/ATLAS_VECTOR_INDEXES.md
</context>

<interfaces>
Request body (Zod): { query: z.string().min(1), types: z.array(z.enum(['idea','episode','script'])).optional(), limit: z.number().min(1).max(50).optional() }
Index names: content_vector_index (contentideas), episode_vector_index (episodes), script_vector_index (scripts)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: POST /api/ai/search semantic search</name>
  <files>src/app/api/ai/search/route.ts</files>
  <action>
Create POST handler.
1. getServerSession(); return 401 if unauthenticated
2. connectToDatabase()
3. Parse body with Zod: { query: z.string().min(1), types: z.array(z.enum(['idea','episode','script'])).optional(), limit: z.number().min(1).max(50).optional() }
4. Default types = ['idea','episode','script'] if not provided; default limit = 10
5. queryEmbedding = await embed(query, { inputType: 'query' })
6. For each type in types, run aggregation in parallel:
   - idea: ContentIdea.aggregate([{ $vectorSearch: { index: 'content_vector_index', path: 'embedding', queryVector: queryEmbedding, numCandidates: Math.max(100, limit * 20), limit } }, { $project: { embedding: 0 } }, { $addFields: { score: { $meta: 'vectorSearchScore' } } }])
   - episode: Episode.aggregate([{ $vectorSearch: { index: 'episode_vector_index', path: 'embedding', queryVector: queryEmbedding, numCandidates: Math.max(100, limit * 20), limit } }, { $project: { embedding: 0 } }, { $addFields: { score: { $meta: 'vectorSearchScore' } } }])
   - script: Script.aggregate([{ $vectorSearch: { index: 'script_vector_index', path: 'embedding', queryVector: queryEmbedding, numCandidates: Math.max(100, limit * 20), limit } }, { $project: { embedding: 0 } }, { $addFields: { score: { $meta: 'vectorSearchScore' } } }])
7. Use Promise.all for parallel execution
8. Handle "index not found" or aggregation errors gracefully; return empty array for that type
9. Return Response.json({ ideas, episodes, scripts })
</action>
  <verify>curl -X POST /api/ai/search -d '{"query":"RAG tutorials"}' returns 200 with ideas, episodes, scripts arrays</verify>
  <done>Semantic search returns results by type</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/ai/search returns { ideas, episodes, scripts }
- Requires Atlas indexes to exist (runbook plan 03)
</verification>

<success_criteria>
- Query embedded with inputType 'query'
- $vectorSearch runs on each collection
- Results exclude embedding field; include score
</success_criteria>
