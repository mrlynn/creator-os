---
phase: sprint6
plan: 05
type: execute
wave: 2
depends_on:
  - sprint5-04
  - sprint5-05
files_modified:
  - src/lib/ai/semantic-dedup.ts
  - src/lib/db/models/ContentIdea.ts
  - src/app/api/ideas/route.ts
autonomous: true
requirements:
  - DEDUP-01
must_haves:
  truths:
    - On ContentIdea create: if similar idea exists (cosine > 0.85), set duplicateWarning + similarIdeaIds
    - checkSemanticDuplicates runs fire-and-forget after idea save
  artifacts:
    - path: src/lib/ai/semantic-dedup.ts
      provides: checkSemanticDuplicates(ideaId)
    - path: src/lib/db/models/ContentIdea.ts
      provides: aiMetadata.duplicateWarning, similarIdeaIds
    - path: src/app/api/ideas/route.ts
      provides: Hook after POST create
  key_links:
    - from: semantic-dedup.ts
      to: embeddings.ts
      via: embed(text)
    - from: semantic-dedup.ts
      to: ContentIdea
      via: $vectorSearch aggregation
---

<objective>
Semantic idea deduplication: on idea create, embed new idea, $vectorSearch for similar; if cosine > 0.85, flag duplicate.
Purpose: Prevent duplicate/similar ideas; requires Sprint 5 embed + vector search.
Output: semantic-dedup.ts, ContentIdea aiMetadata, hook in ideas POST.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@.planning/phases/sprint5/sprint5-04-PLAN.md
@.planning/phases/sprint5/sprint5-05-PLAN.md
@src/lib/ai/embeddings.ts
@src/app/api/ideas/route.ts
</context>

<interfaces>
From embeddings: embed(text, { inputType?: 'document' })
From sprint5-05: $vectorSearch on contentideas with index content_vector_index, path embedding
Order: save idea → embed (async) → when embed done, run $vectorSearch. New idea has no embedding yet: must embed first, then search.
Threshold: 0.85 cosine = fairly similar
ContentIdea: add aiMetadata: { duplicateWarning?: boolean; similarIdeaIds?: ObjectId[] }
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add aiMetadata to ContentIdea and create semantic-dedup.ts</name>
  <files>src/lib/db/models/ContentIdea.ts, src/lib/ai/semantic-dedup.ts</files>
  <action>
1. ContentIdea: add aiMetadata?: { duplicateWarning?: boolean; similarIdeaIds?: mongoose.Types.ObjectId[] } to interface and schema (Schema.Types.Mixed or subdocument)
2. Create src/lib/ai/semantic-dedup.ts
3. Export async function checkSemanticDuplicates(ideaId: string): Promise&lt;void&gt;
4. Logic:
   a. ContentIdea.findById(ideaId); return if not found
   b. Build text: `${idea.title}\n\n${idea.description}`.trim(); if !text return
   c. embedding = await embed(text)  // document mode
   d. ContentIdea.findByIdAndUpdate(ideaId, { $set: { embedding } })  // save embedding first
   e. Run $vectorSearch: ContentIdea.aggregate([{ $vectorSearch: { index: 'content_vector_index', path: 'embedding', queryVector: embedding, numCandidates: 50, limit: 5 } }, { $match: { _id: { $ne: new Types.ObjectId(ideaId) } } }, { $project: { _id: 1, embedding: 0 } }, { $addFields: { score: { $meta: 'vectorSearchScore' } } }])
   f. Filter results: if top result score &gt; 0.85, set aiMetadata.duplicateWarning: true, similarIdeaIds: [top._id]
   g. ContentIdea.findByIdAndUpdate(ideaId, { $set: { aiMetadata: { duplicateWarning, similarIdeaIds } } })
5. Catch errors; log but do not throw (fire-and-forget)
6. Note: $match after $vectorSearch to exclude self (or use filter in $vectorSearch if supported)
  </action>
  <verify>npm run build</verify>
  <done>checkSemanticDuplicates embeds idea, runs vector search, flags if similar</done>
</task>

<task type="auto">
  <name>Task 2: Hook checkSemanticDuplicates in ideas POST</name>
  <files>src/app/api/ideas/route.ts</files>
  <action>
1. Import checkSemanticDuplicates from '@/lib/ai/semantic-dedup'
2. After ContentIdea.create(...) and before return Response.json(idea, 201):
   - Fire-and-forget: checkSemanticDuplicates(idea._id.toString()).catch(console.error)
   - Use void or .catch to avoid blocking response
3. Same pattern as scoreVirality: non-blocking, do not await
  </action>
  <verify>npm run build; create idea similar to existing, verify duplicateWarning in DB</verify>
  <done>Ideas POST triggers semantic dedup after create</done>
</task>

</tasks>

<verification>
- npm run build passes
- Create idea with similar title/description to existing → aiMetadata.duplicateWarning set
- Requires Sprint 5: embeddings, ContentIdea.embedding field, Atlas content_vector_index
</verification>

<success_criteria>
- Fire-and-forget; does not block idea creation
- Threshold 0.85; similarIdeaIds populated
- Order: embed first, then $vectorSearch
</success_criteria>
