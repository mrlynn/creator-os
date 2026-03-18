# Sprint 7: Custom Instruction Profiles, Hybrid Search, RAG — Research

**Researched:** 2026-03-18  
**Domain:** Persona-based AI system prompts, hybrid vector+text search, RAG for content-aware AI operations  
**Confidence:** HIGH

## Summary

Sprint 7 delivers features deferred from Sprint 6 and PRD V2: **Custom instruction profiles** (persona-based system prompts that prepend to AI operations), **Hybrid search** (vector + full-text), and **RAG for AI Toolkit** (semantic retrieval augments prompt context). Custom instruction profiles are the primary in-scope feature — they have no Sprint 5 dependency and integrate cleanly with all existing AI ops. Hybrid search and RAG both require Sprint 5 (embeddings, vector search) to be complete; Sprint 5 is currently **partially implemented** (embeddings.ts exists; embed routes, embed-pipeline, /api/ai/search, and embedding fields on models are not yet deployed).

**Primary recommendation:** Implement Custom instruction profiles in Sprint 7 as the core deliverable. If Sprint 5 is completed first, add Hybrid search and RAG as follow-on features. Otherwise, defer Hybrid and RAG to a sprint after Sprint 5 completion.

---

## Recommended Sprint 7 Scope

### In Scope (No Sprint 5 Dependency)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 1 | **Custom instruction profiles** | Medium | PRD: "Beginner Persona", "Senior Dev Persona", "Viral Hook Mode" — prepend to any AI op. Deferred from Sprint 6. High value for creator workflow consistency. |

### In Scope (Sprint 5 Follow-On — Requires Sprint 5 Complete)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 2 | **Hybrid search (vector + full-text)** | Medium | PRD: "Semantic full-text search" — combines $vectorSearch with Atlas Search text index. Improves Library search for exact keyword + semantic queries. |
| 3 | **RAG for AI Toolkit** | Medium | Use semantic search to inject relevant past content (ideas, episodes, scripts) into prompt context for script-gen, hook-gen, prompt-run. Different use case from Library search. |

### Follow-On (If Time Permits)

| Feature | Effort | Rationale |
|---------|--------|-----------|
| Publishing calendar view | Small | PRD MVP #6 partial; calendar route exists; view not built |
| Voice-to-text on quick-capture | Small | PRD optional from Sprint 2; Web Speech API |

### Deferred

| Feature | Reason |
|---------|--------|
| Batch operations (auto-tag all, batch descriptions) | PRD AI Toolkit; lower priority than profiles |
| Script version history + diff | PRD V1; separate domain |

---

## Sprint 5 Implementation Status (as of 2026-03-18)

| Component | Status | Notes |
|------------|--------|-------|
| embeddings.ts | ✅ Exists | Voyage voyage-3-large, 1024 dims |
| embedding field on ContentIdea, Script, Episode | ❌ Missing | Models have no embedding field |
| POST /api/ideas/[id]/embed, scripts, episodes | ❌ Missing | Embed routes not implemented |
| embed-pipeline.ts | ❌ Missing | embedIdea, embedScript, embedEpisode |
| POST /api/ai/search | ❌ Missing | Semantic search API |
| Atlas vector indexes | Unknown | Must be created in Atlas UI |
| SemanticSearchBar on Library | ❌ Missing | Library has filters only |

**Implication:** Custom instruction profiles can ship independently. Hybrid search and RAG require completing Sprint 5 first (embed pipeline, search API, schema changes).

---

## Architecture: Custom Instruction Profiles

### PRD Specification (Domain 6: AI Toolkit)

> **Custom instruction profiles:** `Beginner Persona`, `Senior Dev Persona`, `Viral Hook Mode` — prepend to any operation

### Data Model

**InstructionProfile** (new model):

```javascript
// src/lib/db/models/InstructionProfile.ts
{
  name: string;           // e.g. "Beginner Persona", "Viral Hook Mode"
  instructionText: string; // System prompt prefix, e.g. "You write for developers new to AI. Use plain language..."
  applicableOperations: string[]; // ['script-generation', 'hook-generation', 'virality-scoring', ...] or ['*'] for all
  isDefault: boolean;     // Optional: use as default when no profile selected
  createdAt: Date;
  updatedAt: Date;
}
```

**Applicable operations** (match AiUsageLog categories):

| Operation | Module | Has System Prompt? | Integration |
|-----------|--------|---------------------|-------------|
| script-generation | script-generator.ts | Yes | Prepend to system |
| hook-generation | hook-generator.ts | No (user only) | Add as system message |
| virality-scoring | virality-scorer.ts | Yes | Prepend to system |
| repurposing | repurposing-engine.ts | Yes | Prepend to system |
| seo-generation | seo-generator.ts | Yes | Prepend to system |
| evergreen-scoring | evergreen-scorer.ts | Yes | Prepend to system |
| planner | planner.ts | Yes | Prepend to system |
| insight-report | insight-reporter.ts | Yes | Prepend to system |
| tagging | auto-tagger.ts | Yes | Prepend to system |
| prompt-run | prompts/[id]/run | No (user only) | Add as system message |

### Integration Pattern

**For ops with system prompt:**

```javascript
// Before (e.g. script-generator.ts)
const systemPrompt = `You are an expert content creator...`;

// After (with profile)
const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
const systemPrompt = profilePrefix
  ? `${profilePrefix}\n\n${baseSystemPrompt}`
  : baseSystemPrompt;
```

**For ops with user-only (hook-generator, prompt-run):**

```javascript
// Add system message when profile provided
const messages = profileId
  ? [
      { role: 'system', content: await getProfileInstruction(profileId) },
      { role: 'user', content: userContent },
    ]
  : [{ role: 'user', content: userContent }];
```

### API Design

| Route | Method | Description |
|-------|--------|-------------|
| /api/instruction-profiles | GET | List profiles |
| /api/instruction-profiles | POST | Create profile |
| /api/instruction-profiles/[id] | GET, PUT, DELETE | CRUD single profile |

**Request body for AI ops:** Add optional `profileId` to existing request bodies. Example:

- POST /api/scripts/[id]/generate — `{ outline?, profileId? }`
- POST /api/scripts/[id]/hooks — `{ profileId? }`
- POST /api/ideas/[id]/score — `{ profileId? }`
- POST /api/episodes/[id]/repurpose — `{ platform?, profileId? }`
- POST /api/episodes/[id]/seo — `{ profileId? }`
- POST /api/episodes/[id]/evergreen — `{ profileId? }`
- POST /api/ai/planner — `{ weekOf?, profileId? }`
- POST /api/ai/insight-report — `{ weekOf?, profileId? }`
- POST /api/prompts/[id]/run — `{ variables, profileId? }`

**Global default:** User setting (e.g. in session or user preferences) for default profile. If set, all AI ops use it when no profileId passed. Store in User model or separate UserPreference collection.

### UI Integration

- **AI Toolkit page:** Add "Instruction Profiles" section — list, create, edit, delete. Select default.
- **Per-operation:** Optional profile dropdown on each AI operation UI (Script generate, Hook Lab, Repurpose, SEO, etc.). If omitted, use default or none.
- **Prompt runner:** Add profile selector above variable inputs.

### File Paths

| Asset | Path |
|-------|------|
| Model | src/lib/db/models/InstructionProfile.ts |
| Schema | src/lib/db/schemas.ts (CreateInstructionProfileSchema, UpdateInstructionProfileSchema) |
| CRUD API | src/app/api/instruction-profiles/route.ts, [id]/route.ts |
| Helper | src/lib/ai/instruction-profile.ts — getProfileInstruction(profileId) |
| AI Toolkit UI | src/app/app/ai-toolkit/page.tsx — add profiles section |
| Profile selector component | src/components/ai/InstructionProfileSelector.tsx (reusable) |

### Example Profile: "Viral Hook Mode"

```
Prioritize hooks that create curiosity gaps and pattern interrupts. Favor bold claims, surprising facts, and "wait, what?" openings. Avoid generic "In this video..." or "Today we'll..." Open with the most shareable insight. Write for maximum scroll-stopping potential on TikTok and click-through on YouTube.
```

When prepended to hook-generator or script-generator, this shifts output toward viral-optimized content.

---

## Technical Approach: Hybrid Search

**Requires:** Sprint 5 complete (embedding field, embed pipeline, $vectorSearch, /api/ai/search).

### Option A: Atlas Search Compound Index (Recommended)

MongoDB Atlas Search supports a `$search` stage with `compound` operator that can combine `vectorSearch` and `text` in one query. Index definition includes both:

```json
{
  "name": "content_hybrid_index",
  "type": "searchIndex",
  "definition": {
    "fields": [
      { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
      { "type": "string", "path": "title", "analyzer": "lucene.standard" },
      { "type": "string", "path": "description", "analyzer": "lucene.standard" }
    ]
  }
}
```

Query uses `$search` with compound:

```javascript
{
  $search: {
    index: "content_hybrid_index",
    compound: {
      should: [
        { vectorSearch: { path: "embedding", queryVector: queryEmbedding, numCandidates: 100 } },
        { text: { query: userQuery, path: ["title", "description"] } }
      ]
    }
  }
}
```

**Caveat:** Atlas Search `vectorSearch` operator (inside $search) may differ from standalone $vectorSearch. Verify MongoDB docs for exact syntax. Alternative: run vector and text searches in parallel, merge with RRF (Reciprocal Rank Fusion).

### Option B: Parallel Search + RRF

1. Run $vectorSearch → results A
2. Run Atlas Search $search (text) → results B
3. Merge with RRF: `score(d) = sum(1 / (k + rank(d)))` for k=60
4. Sort by combined score, return top N

**Pros:** Works with existing Sprint 5 vector index; no new compound index. **Cons:** Two queries, more latency.

### Data Flow

- POST /api/ai/search — add `mode?: 'vector' | 'hybrid'` (default vector for backward compat)
- When mode=hybrid: embed query + run text search; merge; return
- SemanticSearchBar: add toggle or default to hybrid when available

---

## Technical Approach: RAG for AI Toolkit

**Requires:** Sprint 5 semantic search (POST /api/ai/search) complete.

### Use Case

When generating a script, running a prompt, or creating hooks, retrieve semantically relevant past content (ideas, episodes, scripts) and inject into prompt context. Example: "When writing this script about RAG, here are 3 similar past scripts/episodes for style and terminology consistency."

### Data Flow

1. **Retrieve:** Before AI call, run semantic search with query derived from current context (e.g. idea title + description, or prompt variables).
2. **Format:** Build context string from top-K results (title, summary, key excerpts).
3. **Inject:** Append to system prompt or user prompt: `\n\nRelevant past content for context:\n${context}`

### Integration Points

| Operation | Query Source | Injected Where |
|-----------|--------------|----------------|
| Script generation | idea title + outline | System prompt suffix |
| Hook generation | script content (first 200 words) | User prompt suffix |
| Prompt run | variables (e.g. {{title}}, {{script}}) | User prompt suffix |
| Repurpose | episode title + script | System prompt suffix |
| SEO | episode title + tags | System prompt suffix |

### API Design

- Add optional `ragContext?: boolean` or `includeRag?: boolean` to AI op requests. When true, run retrieval and inject.
- Optional `ragLimit?: number` (default 3) — number of documents to retrieve.
- New helper: `getRagContext(query: string, types: string[], limit: number): Promise<string>`

### File Paths

- src/lib/ai/rag-retrieval.ts — getRagContext(query, types, limit)
- Integrate into script-generator, hook-generator, repurposing-engine, seo-generator, prompt-run

---

## Standard Stack

### Core (Existing)

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x | App Router, API routes |
| Material-UI | 5.15.x | UI components |
| MongoDB + Mongoose | 8.3.x | Data persistence |
| OpenAI | 4.52.x | GPT-4 |
| Zod | 3.23.x | Validation |

### Sprint 5 Additions (If Sprint 5 Complete)

| Library | Version | Purpose |
|---------|---------|---------|
| voyageai | ^0.2.x | Embeddings (already in embeddings.ts) |

---

## Architecture Patterns

### AI Module Pattern (Existing)

- src/lib/ai/*.ts: getOpenAIClient(), logAiUsage(), return { success, data/error, tokensUsed?, durationMs? }
- All AI ops accept optional profileId; helper fetches and prepends

### API Route Pattern (Existing)

- connectToDatabase() from @/lib/db/connection
- getServerSession() from @/lib/auth
- Zod validation for request body

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Profile storage | In-memory or file | InstructionProfile Mongoose model |
| Hybrid search merge | Custom scoring | RRF or Atlas compound $search |
| RAG retrieval | Custom similarity | POST /api/ai/search (Sprint 5) |

---

## Common Pitfalls

### Custom Instruction Profiles

- **Profile too long:** Consumes tokens. Cap instructionText to ~500 chars or 1 system message equivalent.
- **Conflicting instructions:** Profile says "beginner" but operation has audience=advanced. Document that profile prepends; operation-specific params still apply.
- **Prompt-run security:** Profile becomes system message. Do not allow arbitrary user-defined system prompts from untrusted input; profiles are created by authenticated user.

### Hybrid Search

- **Index creation:** Atlas Search index with both vector and text fields. Manual in Atlas UI.
- **Text analyzer:** Use lucene.standard for title/description.

### RAG

- **Context overflow:** 3 docs × ~500 chars = ~1500 chars. Stay within model context. Truncate if needed.
- **Stale retrieval:** Embeddings must exist. If embed-on-create not run, retrieval may miss recent content.

---

## Dependencies on Sprint 5/6

| Sprint 7 Feature | Sprint 5 Required? | Sprint 6 Required? |
|-----------------|-------------------|-------------------|
| Custom instruction profiles | No | No |
| Hybrid search | **Yes** (embed, vector index, search API) | No |
| RAG for AI Toolkit | **Yes** (search API) | No |

---

## Verification Steps

### Custom Instruction Profiles

1. Create profile "Beginner Persona" with instruction text
2. POST /api/scripts/[id]/generate with profileId → script tone matches beginner
3. POST /api/scripts/[id]/hooks with profileId → hooks reflect profile
4. POST /api/prompts/[id]/run with profileId → output reflects profile
5. AI Toolkit: list profiles, create, edit, delete, set default

### Hybrid Search (Sprint 5 Complete)

1. POST /api/ai/search with mode=hybrid, query="RAG tutorial" → returns vector + text matches
2. SemanticSearchBar with hybrid → results include exact keyword matches

### RAG (Sprint 5 Complete)

1. Create 2 episodes about RAG; ensure embeddings exist
2. Generate script for new RAG idea with includeRag=true → context includes past RAG content
3. Prompt run with RAG → output references past content when relevant

---

## Suggested Implementation Order

1. **Custom instruction profiles** — InstructionProfile model, CRUD API, getProfileInstruction helper, integrate into script-generator, hook-generator, virality-scorer, repurposing-engine, seo-generator, evergreen-scorer, planner, insight-reporter, auto-tagger, prompt-run. Add UI: AI Toolkit profiles section, profile selector component.
2. **(If Sprint 5 done)** Hybrid search — Atlas Search compound index or parallel + RRF; extend /api/ai/search; SemanticSearchBar
3. **(If Sprint 5 done)** RAG — getRagContext helper; integrate into script-gen, hook-gen, prompt-run, repurpose, SEO

---

## Phase Requirements (Sprint 7)

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROFILE-01 | InstructionProfile model with name, instructionText, applicableOperations | New model; schema |
| PROFILE-02 | CRUD API for instruction profiles | Series/tags pattern |
| PROFILE-03 | getProfileInstruction(profileId) helper | Fetches and returns instruction text |
| PROFILE-04 | Integrate profile into script-gen, hook-gen, virality, repurpose, SEO, evergreen, planner, insight-report, tagging, prompt-run | All 10 AI ops; prepend pattern |
| PROFILE-05 | AI Toolkit UI: profiles section, create/edit/delete, default selector | ai-toolkit page |
| PROFILE-06 | Profile selector component for per-operation use | Reusable MUI component |
| HYBRID-01 | Hybrid search API (vector + text) | Sprint 5 + Atlas Search |
| RAG-01 | getRagContext helper | Sprint 5 search API |
| RAG-02 | RAG injection into script-gen, hook-gen, prompt-run | Integration points |

---

## Sources

### Primary (HIGH confidence)

- Creator OS codebase: script-generator, hook-generator, virality-scorer, repurposing-engine, seo-generator, evergreen-scorer, planner, insight-reporter, auto-tagger, prompt-run
- PRD.md: Custom instruction profiles (Domain 6); AI Integration Opportunity Matrix
- Sprint 4 RESEARCH.md: Prompt library, repurposing patterns
- Sprint 5 RESEARCH.md: Embedding pipeline, vector search
- Sprint 6 RESEARCH.md: Deferred items, scope

### Secondary (MEDIUM confidence)

- MongoDB Atlas $vectorSearch docs: vector-search-stage
- Atlas Search compound operator for hybrid: requires verification

---

## Metadata

**Confidence breakdown:**
- Custom instruction profiles: HIGH — clear PRD spec, straightforward integration
- Hybrid search: MEDIUM — Atlas Search compound syntax needs verification
- RAG: HIGH — standard RAG pattern, depends on Sprint 5

**Research date:** 2026-03-18  
**Valid until:** ~30 days
