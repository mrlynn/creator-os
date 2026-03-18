# Sprint 5: Atlas Vector Search + Semantic Search — Research

**Researched:** 2026-03-18  
**Domain:** MongoDB Atlas Vector Search, Voyage AI embeddings, semantic search for content ideas/episodes/scripts  
**Confidence:** HIGH

## Summary

Sprint 5 delivers **Atlas Vector Search + semantic search** deferred from Sprint 4. This requires new infrastructure: Voyage AI client, `embedding` field on ContentIdea/Episode/Script, Atlas vector index creation, and an embedding pipeline. The PRD specifies 1024-dim Voyage embeddings and semantic search across ideas, episodes, and scripts. **Follow-on features** that build on vector search include: **Semantic idea deduplication** (flag near-duplicate ideas on capture), **SemanticSearchBar** on Content Library (PRD component), and optional **batch embedding job** for backfilling existing content.

**Primary recommendation:** Implement core vector search (Voyage client, schema changes, embedding pipeline, search API, Library search bar) in Sprint 5. Add semantic deduplication as a follow-on if time permits.

---

## Recommended Sprint 5 Scope

### In Scope (Core)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 1 | **Voyage AI client + embeddings module** | Small | New `src/lib/ai/embeddings.ts`; singleton pattern like openai-client; `embed(text, inputType?)` |
| 2 | **Schema changes: embedding field** | Small | Add `embedding: number[]` with `select: false` to ContentIdea, Script, Episode |
| 3 | **Atlas Vector Search indexes** | Small | Create indexes in Atlas UI (or via API) for contentideas, episodes, scripts |
| 4 | **Embedding pipeline** | Medium | POST `/api/ideas/[id]/embed`, `/api/scripts/[id]/embed`, `/api/episodes/[id]/embed`; build text, call Voyage, save |
| 5 | **Semantic search API** | Medium | POST `/api/ai/search` — embed query, run `$vectorSearch` aggregation, return unified results |
| 6 | **SemanticSearchBar on Library** | Medium | PRD component; search input → API call → display results (ideas, episodes, scripts) |

### Follow-On (If Time Permits)

| Feature | Effort | Rationale |
|---------|--------|-----------|
| Semantic idea deduplication | Small | On idea create: embed, search for similar; flag if cosine > threshold. PRD: "20 min/week" |
| Batch embedding job | Small | Cron or manual trigger to embed all documents missing embeddings |
| Embed on create (fire-and-forget) | Small | After idea/episode/script create, trigger embed in background |

### Deferred

| Feature | Reason |
|---------|--------|
| Hybrid search (vector + full-text) | Requires Atlas Search text index; can add later |
| RAG for AI Toolkit | Different use case; semantic search is foundation |

---

## Architecture & Data Flow

### Text Extraction for Embedding

**ContentIdea:** `title + description` (primary semantic content)

**Script:** Sections `[hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')` — same pattern as repurposing-engine and auto-tagger

**Episode:** `title + (description || '')` + populated script full text (via scriptId)

```javascript
// Reuse pattern from auto-tagger.ts, repurposing-engine.ts
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const scriptText = sections.filter(Boolean).join('\n\n');
const fullText = `${episode.title}\n\n${scriptText}`.trim();
// Truncate to ~8K chars if needed (Voyage context ~32K tokens)
```

### Embedding Pipeline Flow

1. **Trigger:** POST `/api/ideas/[id]/embed` (or scripts/episodes)
2. **Fetch** document; build text to embed
3. **Call** Voyage `embed({ input: text, model: 'voyage-3-large', input_type: 'document', output_dimension: 1024 })`
4. **Save** `embedding` field via `findByIdAndUpdate`
5. **Log** `logAiUsage({ category: 'embedding', ... })`

### Semantic Search Flow

1. **Request:** POST `/api/ai/search` with `{ query: "RAG tutorials for beginners", types?: ['idea','episode','script'], limit?: 10 }`
2. **Embed query:** `embed(query, 'query')` — use `input_type: 'query'` for retrieval
3. **Run $vectorSearch** on each collection (or unified if using single collection — PRD uses separate collections)
4. **Merge & rank** results; return `{ ideas, episodes, scripts }` with scores

**Unified vs separate search:** PRD has separate indexes per collection. Run 3 parallel `$vectorSearch` aggregations (contentideas, episodes, scripts), merge by score, limit total.

---

## Standard Stack

### Core (Existing)

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x | App Router, API routes |
| Material-UI | 5.15.x | UI components |
| MongoDB + Mongoose | 8.3.x | Data persistence, aggregation |
| Zod | 3.23.x | Validation |

### New Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| voyageai | ^0.2.1 | Voyage AI embeddings API |

**Installation:**
```bash
npm install voyageai
```

---

## Technical Implementation

### 1. Voyage AI Client & Embeddings Module

**File:** `src/lib/ai/embeddings.ts`

```javascript
import { VoyageAIClient } from 'voyageai';
import { logAiUsage } from './usage-logger';

const VOYAGE_MODEL = 'voyage-3-large'; // or voyage-4-large
const OUTPUT_DIM = 1024;

let voyageClient = null;

function getVoyageClient() {
  if (!voyageClient) {
    const key = process.env.VOYAGE_API_KEY;
    if (!key) throw new Error('VOYAGE_API_KEY is required');
    voyageClient = new VoyageAIClient({ apiKey: key });
  }
  return voyageClient;
}

export async function embed(
  text: string,
  options?: { inputType?: 'query' | 'document' }
) {
  const client = getVoyageClient();
  const start = Date.now();
  const res = await client.embed({
    input: text,
    model: VOYAGE_MODEL,
    input_type: options?.inputType ?? 'document',
    output_dimension: OUTPUT_DIM,
  });
  const duration = Date.now() - start;
  logAiUsage({
    category: 'embedding',
    tokensUsed: res.usage?.total_tokens ?? 0,
    durationMs: duration,
    aiModel: VOYAGE_MODEL,
    success: true,
  }).catch(console.error);
  return res.data[0].embedding;
}
```

**Note:** AiUsageLog needs `'embedding'` category. Add to `usage-logger.ts` and `AiUsageLog` model enum.

### 2. Schema Changes

**ContentIdea** (`src/lib/db/models/ContentIdea.ts`):
```javascript
embedding: { type: [Number], select: false },
```

**Script** (`src/lib/db/models/Script.ts`):
```javascript
embedding: { type: [Number], select: false },
```

**Episode** (`src/lib/db/models/Episode.ts`):
```javascript
embedding: { type: [Number], select: false },
```

**Zod:** No validation needed for embedding (server-only, not user input).

### 3. Atlas Vector Search Index Definitions

Create in Atlas UI: Database → Collections → [collection] → Search Indexes → Create Index.

**contentideas** — index name `content_vector_index`:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" },
    { "type": "filter", "path": "platform" },
    { "type": "filter", "path": "audience" }
  ]
}
```

**episodes** — index name `episode_vector_index`:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "publishingStatus" },
    { "type": "filter", "path": "editingStatus" }
  ]
}
```

**scripts** — index name `script_vector_index`:
```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" }
  ]
}
```

**Index creation:** Manual in Atlas UI, or document in README/runbook. No programmatic creation in app (Atlas manages indexes).

### 4. Embed API Routes

**POST `/api/ideas/[id]/embed`**
- Auth: getServerSession
- Fetch ContentIdea by id
- Build text: `idea.title + '\n\n' + idea.description`
- Call `embed(text)`
- `ContentIdea.findByIdAndUpdate(id, { embedding })`
- Return `{ success: true }`

**POST `/api/scripts/[id]/embed`**
- Fetch Script; build text from sections
- Same flow

**POST `/api/episodes/[id]/embed`**
- Fetch Episode with scriptId populated
- Build text from title + description + script sections
- Same flow

### 5. Semantic Search API

**POST `/api/ai/search`**

Request body (Zod):
```javascript
{ query: z.string().min(1), types: z.array(z.enum(['idea','episode','script'])).optional(), limit: z.number().min(1).max(50).optional() }
```

Flow:
1. Embed query with `inputType: 'query'`
2. For each type in `types` (default all): run aggregation:
```javascript
[
  { $vectorSearch: {
    index: 'content_vector_index',
    path: 'embedding',
    queryVector: queryEmbedding,
    numCandidates: 100,
    limit: limit ?? 10,
  }},
  { $project: { embedding: 0 } },
  { $addFields: { score: { $meta: 'vectorSearchScore' } } }
]
```
3. Merge results; sort by score; return `{ ideas, episodes, scripts }`

**Mongoose aggregation:** Use `ContentIdea.aggregate([...])` — $vectorSearch is first stage.

### 6. SemanticSearchBar Component

**File:** `src/components/library/SemanticSearchBar.tsx`

- TextField with search icon; debounced input (300ms)
- On submit: POST `/api/ai/search` with `{ query }`
- Display results: grouped by type (Ideas, Episodes, Scripts); each item links to detail page
- Loading state; empty state "No results"
- Reuse: EpisodeCard pattern for episode results; simple list for ideas/scripts

**Integration:** Add to `src/app/app/library/page.tsx` — above or beside existing filters.

---

## Architecture Patterns

### AI Module Pattern (Existing)
- `src/lib/ai/*.ts`: return `{ success, data/error, tokensUsed?, durationMs? }`
- `logAiUsage` fire-and-forget
- Singleton client (getVoyageClient like getOpenAIClient)

### API Route Pattern (Existing)
- `connectToDatabase()`, `getServerSession()`, Zod validation
- `Response.json()` with status codes

### Text Extraction (Reuse)
- Script: `[hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')`
- Same as `auto-tagger.ts`, `repurposing-engine.ts`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|--------|------------|-------------|
| Embeddings | Custom model | Voyage AI `voyage-3-large` or `voyage-4-large` |
| Vector search | Custom similarity | MongoDB `$vectorSearch` aggregation |
| Index creation | App code | Atlas UI or Atlas Admin API |

---

## Common Pitfalls

### Embedding
- **Empty text:** Script/episode with no content → skip embed or use title only
- **Token limit:** Voyage voyage-3-large 120K tokens per batch; truncate to ~8K chars for safety
- **input_type:** Use `document` for indexing, `query` for search — improves retrieval quality

### Vector Search
- **Index not ready:** Atlas indexes can take minutes to build. Handle "index not found" gracefully
- **numCandidates:** Use at least 20× limit for good recall (e.g. limit 10 → numCandidates 200)
- **Missing embedding:** Documents without embedding are excluded from $vectorSearch. Filter or handle empty results

### Schema
- **select: false:** Keeps embedding out of default queries (large payload). Use `.select('+embedding')` when needed for updates only

---

## Existing Code to Reuse

| Asset | Location | Use |
|-------|----------|-----|
| connectToDatabase | `src/lib/db/connection.ts` | All DB ops |
| getServerSession | `src/lib/auth` | API auth |
| logAiUsage | `src/lib/ai/usage-logger.ts` | Add 'embedding' category |
| Script section extraction | `src/lib/ai/auto-tagger.ts` | Build script text |
| Episode + script fetch | `src/app/api/episodes/[id]/repurpose` | Populate scriptId |
| Library page | `src/app/app/library/page.tsx` | Add SemanticSearchBar |
| Episode detail link | `src/app/app/library/[id]/page.tsx` | Result links |
| Idea detail | `src/app/app/ideas/[id]/page.tsx` | Idea result links |
| Script detail | `src/app/app/scripts/[id]/page.tsx` | Script result links |

---

## Environment & Configuration

**New env var:** `VOYAGE_API_KEY` (already in `.env.example`)

**AiUsageLog:** Add `'embedding'` to category enum in `src/lib/db/models/AiUsageLog.ts` and `usage-logger.ts`.

---

## Verification Steps

1. **Voyage client:** Unit test or manual: `embed("test")` returns 1024-dim array
2. **Embed route:** POST to `/api/ideas/[id]/embed` → document has embedding in DB (check with Compass, exclude default projection)
3. **Search API:** Embed a few ideas; POST `/api/ai/search` with related query → returns those ideas
4. **UI:** SemanticSearchBar returns results; links work
5. **Index:** Ensure Atlas indexes exist and `$vectorSearch` runs without error

---

## Dependencies & Risks

### Dependencies
- **MongoDB Atlas** M10+ recommended for vector search (check cluster tier)
- **MongoDB version:** v6.0.11+ or v7.0.2+ for $vectorSearch
- **Voyage API key:** Required; get from voyageai.com

### Risks
- **Index creation:** Manual step; document clearly for deploy
- **Backfill:** Existing documents have no embeddings; search won't find them until embedded. Consider batch job or embed-on-create

---

## Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Voyage AI | OpenAI text-embedding-3 | OpenAI 1536 dims; would need different index; Voyage PRD-specified |
| Separate indexes | Single unified collection | PRD uses separate ContentIdea/Episode/Script; keeps schema clean |
| Embed on create | Manual embed only | Fire-and-forget on create adds latency; optional follow-on |

---

## Phase Requirements (Sprint 5)

| ID | Description | Research Support |
|----|-------------|------------------|
| VEC-01 | Voyage AI client + embed(text, inputType) | voyageai npm; docs.voyageai.com |
| VEC-02 | embedding field on ContentIdea, Script, Episode | Schema changes; select: false |
| VEC-03 | Atlas vector indexes (contentideas, episodes, scripts) | Index JSON definitions |
| VEC-04 | POST /api/ideas/[id]/embed, scripts, episodes | Embed pipeline; text extraction |
| VEC-05 | POST /api/ai/search — semantic search | $vectorSearch aggregation |
| VEC-06 | SemanticSearchBar on Library page | PRD component; MUI TextField |

---

## Sources

### Primary (HIGH confidence)
- Voyage AI API: docs.voyageai.com/reference/embeddings-api
- MongoDB Atlas $vectorSearch: mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/
- voyageai npm: npmjs.com/package/voyageai (v0.2.1)
- Creator OS codebase: models, APIs, auto-tagger, repurposing-engine
- PRD.md: embedding spec, index definitions, API blueprint

### Secondary (MEDIUM confidence)
- Voyage voyage-3-large, voyage-4-large: 1024 dims supported (output_dimension param)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Voyage + Atlas well-documented
- Architecture: HIGH — PRD and Sprint 4 RESEARCH provide clear spec
- Pitfalls: MEDIUM — index creation, backfill are operational concerns

**Research date:** 2026-03-18  
**Valid until:** ~30 days
