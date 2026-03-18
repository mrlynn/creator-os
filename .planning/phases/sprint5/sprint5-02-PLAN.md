---
phase: sprint5
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/db/models/ContentIdea.ts
  - src/lib/db/models/Script.ts
  - src/lib/db/models/Episode.ts
autonomous: true
requirements:
  - VEC-02
must_haves:
  truths:
    - ContentIdea, Script, Episode have embedding field (select: false)
    - embedding excluded from default queries; use .select('+embedding') when needed
  artifacts:
    - path: src/lib/db/models/ContentIdea.ts
      provides: embedding: [Number], select: false
    - path: src/lib/db/models/Script.ts
      provides: embedding: [Number], select: false
    - path: src/lib/db/models/Episode.ts
      provides: embedding: [Number], select: false
  key_links:
    - from: Atlas vector index
      to: embedding path
      via: $vectorSearch on embedding field
---

<objective>
Schema changes: add embedding field to ContentIdea, Script, Episode with select: false.
Purpose: Store 1024-dim Voyage embeddings for vector search; keep default queries lean.
Output: embedding field on all three models.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
@src/lib/db/models/ContentIdea.ts
@src/lib/db/models/Script.ts
@src/lib/db/models/Episode.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add embedding field to ContentIdea, Script, Episode</name>
  <files>src/lib/db/models/ContentIdea.ts, src/lib/db/models/Script.ts, src/lib/db/models/Episode.ts</files>
  <action>
1. ContentIdea: add to schema: embedding: { type: [Number], select: false }
   - Add embedding?: number[] to IContentIdea interface
2. Script: add to schema: embedding: { type: [Number], select: false }
   - Add embedding?: number[] to IScript interface
3. Episode: add to schema: embedding: { type: [Number], select: false }
   - Add embedding?: number[] to IEpisode interface

No Zod validation needed (server-only, not user input).
  </action>
  <verify>npm run build</verify>
  <done>All three models have embedding field with select: false</done>
</task>

</tasks>

<verification>
- npm run build passes
- Models compile; embedding not in default projection
</verification>

<success_criteria>
- embedding: number[] with select: false on ContentIdea, Script, Episode
</success_criteria>
