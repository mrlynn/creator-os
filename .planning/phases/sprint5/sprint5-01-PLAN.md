---
phase: sprint5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/embeddings.ts
  - src/lib/ai/usage-logger.ts
  - src/lib/db/models/AiUsageLog.ts
  - package.json
autonomous: true
requirements:
  - VEC-01
must_haves:
  truths:
    - embed(text) returns 1024-dim number array
    - embed(text, { inputType: 'query' }) uses query mode for retrieval
  artifacts:
    - path: src/lib/ai/embeddings.ts
      provides: embed(text, options?), getVoyageClient()
    - path: src/lib/ai/usage-logger.ts
      provides: 'embedding' category
    - path: src/lib/db/models/AiUsageLog.ts
      provides: 'embedding' enum value
  key_links:
    - from: embeddings.ts
      to: voyageai
      via: VoyageAIClient.embed()
    - from: embeddings.ts
      to: usage-logger.ts
      via: logAiUsage({ category: 'embedding' })
---

<objective>
Voyage AI client + embeddings module: singleton client, embed(text, inputType), usage logging.
Purpose: Foundation for semantic search; embed documents and queries.
Output: embeddings.ts, voyageai dependency, 'embedding' category in usage-logger and AiUsageLog.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
@src/lib/ai/openai-client.ts
@src/lib/ai/usage-logger.ts
@src/lib/db/models/AiUsageLog.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install voyageai and add embeddings module</name>
  <files>package.json, src/lib/ai/embeddings.ts</files>
  <action>
1. Run: npm install voyageai
2. Create src/lib/ai/embeddings.ts:
   - Import VoyageAIClient from 'voyageai', logAiUsage from './usage-logger'
   - Singleton: getVoyageClient() returns new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY }); throw if key missing
   - export async function embed(text: string, options?: { inputType?: 'query' | 'document' }): Promise&lt;number[]&gt;
   - Call client.embed({ input: text, model: 'voyage-3-large', input_type: options?.inputType ?? 'document', output_dimension: 1024 })
   - logAiUsage({ category: 'embedding', tokensUsed: res.usage?.total_tokens ?? 0, durationMs, aiModel: 'voyage-3-large', success: true }).catch(console.error)
   - Return res.data[0].embedding
   - Truncate text to ~8000 chars if longer (Voyage context limit)
   - Handle empty text: return [] or throw
  </action>
  <verify>npm run build</verify>
  <done>embed() returns 1024-dim array; voyageai installed</done>
</task>

<task type="auto">
  <name>Task 2: Add embedding category to usage-logger and AiUsageLog</name>
  <files>src/lib/ai/usage-logger.ts, src/lib/db/models/AiUsageLog.ts</files>
  <action>
1. In usage-logger.ts: add 'embedding' to category union type
2. In AiUsageLog.ts: add 'embedding' to IAiUsageLog interface and schema enum array
  </action>
  <verify>npm run build</verify>
  <done>'embedding' category accepted by logAiUsage and AiUsageLog</done>
</task>

</tasks>

<verification>
- npm run build passes
- embed("test") returns array of length 1024
</verification>

<success_criteria>
- Voyage client singleton pattern like openai-client
- embed(text) and embed(text, { inputType: 'query' }) work
- Usage logged with category 'embedding'
</success_criteria>
