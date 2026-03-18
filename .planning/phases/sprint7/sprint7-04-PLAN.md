---
phase: sprint7
plan: 04
type: execute
wave: 1
depends_on:
  - sprint5-05
files_modified:
  - src/app/api/ai/search/route.ts
autonomous: true
requirements:
  - HYBRID-01
must_haves:
  truths:
    - POST /api/ai/search with mode=hybrid returns combined vector + text matches
    - mode=vector (default) preserves existing behavior
  artifacts:
    - path: src/app/api/ai/search/route.ts
      provides: mode param, hybrid search logic
  key_links:
    - from: search/route.ts
      to: embeddings.ts
      via: embed(query)
    - from: search/route.ts
      to: Atlas Search / $vectorSearch
      via: compound or parallel queries
---

<objective>
Hybrid search: combine vector similarity with full-text search.
Purpose: Library search supports both semantic and exact keyword queries.
Output: mode=hybrid on POST /api/ai/search; vector + text merge.
</objective>

<context>
@.planning/phases/sprint7/RESEARCH.md
@.planning/phases/sprint5/sprint5-05-PLAN.md
@src/app/api/ai/search/route.ts
</context>

<interfaces>
Requires sprint5-05 complete: POST /api/ai/search exists with vector search
Request body: add mode?: 'vector' | 'hybrid' (default 'vector')
Option A: Atlas Search compound index with vectorSearch + text in $search
Option B: Parallel vector + text queries, merge with RRF (k=60)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add mode param and hybrid search logic</name>
  <files>src/app/api/ai/search/route.ts</files>
  <action>
1. Add mode: z.enum(['vector','hybrid']).optional() to request body schema; default 'vector'
2. When mode=vector: keep existing behavior (no change)
3. When mode=hybrid:
   a. Run existing vector search (embed + $vectorSearch per type)
   b. Run Atlas Search text search: $search with text operator on title, description (or equivalent paths). Use index per collection if available. If Atlas Search text index not created, use $text search on standard index (requires text index on fields)
   c. Merge results: Option B (parallel + RRF) — run vector and text in parallel, merge with Reciprocal Rank Fusion: score(d) = sum(1/(k+rank(d))) for k=60
   d. Sort merged by combined score, return top limit per type
4. If Atlas Search compound index exists (Option A): use $search with compound { should: [vectorSearch, text] } — verify MongoDB docs for exact syntax
5. Prefer Option B if compound index syntax unclear; document Option A in comments for future
6. Return same shape: { ideas, episodes, scripts }
</action>
  <verify>npm run build; curl POST /api/ai/search with mode=hybrid returns 200</verify>
  <done>mode=hybrid returns combined vector + text results</done>
</task>

</tasks>

<verification>
- npm run build passes
- mode=vector unchanged (backward compat)
- mode=hybrid returns results (vector + text when text index exists)
</verification>

<success_criteria>
- No breaking changes to default mode
- Hybrid improves recall for keyword + semantic queries
</success_criteria>
