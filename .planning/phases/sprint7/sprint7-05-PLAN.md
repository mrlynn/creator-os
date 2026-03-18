---
phase: sprint7
plan: 05
type: execute
wave: 1
depends_on:
  - sprint5-05
files_modified:
  - src/lib/ai/rag-retrieval.ts
  - src/lib/ai/script-generator.ts
  - src/lib/ai/hook-generator.ts
  - src/lib/ai/repurposing-engine.ts
  - src/lib/ai/seo-generator.ts
  - src/app/api/scripts/[id]/generate/route.ts
  - src/app/api/scripts/[id]/hooks/route.ts
  - src/app/api/episodes/[id]/repurpose/route.ts
  - src/app/api/episodes/[id]/seo/route.ts
  - src/app/api/prompts/[id]/run/route.ts
autonomous: true
requirements:
  - RAG-01
  - RAG-02
must_haves:
  truths:
    - getRagContext(query, types, limit) returns formatted context string from semantic search
    - Script generation with includeRag=true injects past content into prompt
    - Hook generation with includeRag=true injects past content
    - Prompt run with includeRag=true injects past content
    - Repurpose and SEO with includeRag=true inject past content
  artifacts:
    - path: src/lib/ai/rag-retrieval.ts
      provides: getRagContext(query, types, limit)
  key_links:
    - from: rag-retrieval.ts
      to: embeddings.ts
      via: embed(query)
    - from: rag-retrieval.ts
      to: ContentIdea, Episode, Script
      via: $vectorSearch
    - from: script-generator
      to: rag-retrieval
      via: getRagContext when includeRag
---

<objective>
RAG for AI Toolkit: retrieve relevant past content and inject into prompt context.
Purpose: Script-gen, hook-gen, prompt-run use past content for style/terminology consistency.
Output: getRagContext helper, integration into script-gen, hook-gen, repurpose, SEO, prompt-run.
</objective>

<context>
@.planning/phases/sprint7/RESEARCH.md
@.planning/phases/sprint5/sprint5-05-PLAN.md
@src/lib/ai/script-generator.ts
@src/lib/ai/hook-generator.ts
</context>

<interfaces>
Requires sprint5-05: embedding field, vector indexes on ContentIdea, Episode, Script
getRagContext(query: string, types: string[], limit: number): Promise&lt;string&gt;
Returns formatted string: "Relevant past content:\n- [title]: [excerpt]..." — truncate each doc ~500 chars
Integration: append to system prompt (script-gen) or user prompt (hook-gen, prompt-run)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create getRagContext helper</name>
  <files>src/lib/ai/rag-retrieval.ts</files>
  <action>
1. Create src/lib/ai/rag-retrieval.ts
2. Export async function getRagContext(query: string, types: string[] = ['idea','episode','script'], limit: number = 3): Promise&lt;string&gt;
3. connectToDatabase()
4. queryEmbedding = await embed(query, { inputType: 'query' })
5. Run $vectorSearch on each type in parallel (same as sprint5-05 search)
6. Merge results, sort by score, take top limit total
7. Format: for each doc, build line "- [title]: [excerpt]" — excerpt = first ~200 chars of description or script text
8. Join with newlines; prefix "Relevant past content for context:\n\n"
9. Return empty string if no results
10. Truncate total output to ~1500 chars to avoid context overflow
</action>
  <verify>npm run build; getRagContext('RAG tutorial', ['episode'], 3) returns string</verify>
  <done>getRagContext returns formatted context from semantic search</done>
</task>

<task type="auto">
  <name>Task 2: Integrate RAG into script-gen, hook-gen, prompt-run, repurpose, SEO</name>
  <files>src/lib/ai/script-generator.ts, src/lib/ai/hook-generator.ts, src/lib/ai/repurposing-engine.ts, src/lib/ai/seo-generator.ts, src/app/api/scripts/[id]/generate/route.ts, src/app/api/scripts/[id]/hooks/route.ts, src/app/api/episodes/[id]/repurpose/route.ts, src/app/api/episodes/[id]/seo/route.ts, src/app/api/prompts/[id]/run/route.ts</files>
  <action>
1. script-generator: add includeRag?, ragLimit? to generateScriptFromOutline. When includeRag, query = outline (first 200 chars), ragContext = await getRagContext(query, ['idea','episode','script'], ragLimit ?? 3). Append to system prompt when non-empty
2. hook-generator: add includeRag?, ragLimit? to generateHooks. Query = scriptContent first 200 chars. Append ragContext to user prompt (youtube and tiktok) when non-empty
3. repurposing-engine: add includeRag?, ragLimit? to generateClipConcepts. Query = title + script first 200 chars. Append ragContext to system prompt when non-empty
4. seo-generator: add includeRag?, ragLimit? to generateSeo. Query = title + tags. Append ragContext to system prompt when non-empty
5. prompt-run route: parse body.includeRag, body.ragLimit. Query = filledTemplate first 200 chars. Call getRagContext, append to user message when non-empty
6. Routes: parse includeRag, ragLimit from body; pass to AI libs (generate, hooks, repurpose, seo)
</action>
  <verify>npm run build; POST with includeRag=true returns output</verify>
  <done>RAG injected into script-gen, hook-gen, repurpose, SEO, prompt-run when includeRag=true</done>
</task>

</tasks>

<verification>
- npm run build passes
- getRagContext returns non-empty when content exists
- includeRag=true changes output (manual verification)
</verification>

<success_criteria>
- RAG optional; no impact when includeRag false/omitted
- Context truncated to avoid overflow
- Requires Sprint 5: embedding fields, vector indexes
</success_criteria>
