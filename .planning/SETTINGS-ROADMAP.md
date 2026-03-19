# Settings & AI Configuration — Roadmap

**Initiative:** Comprehensive Settings page for Creator OS  
**Stack:** Next.js 14, MongoDB Atlas, Material-UI  
**Last updated:** 2026-03-19

## Overview

Transform Creator OS from hardcoded AI configuration to a configurable system with a Settings UI. Phases progress from config foundation → LLM abstraction → embeddings/RAG/tunables → Settings page UI.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Config storage** | MongoDB (AppConfig document) | Tunables editable at runtime without redeploy; env vars for secrets only |
| **API key storage** | Environment variables only | Keys never in DB; secure, no encryption burden |
| **Scope** | Global (single-tenant) | App is single-user; no per-user settings for v1 |
| **Provider extensibility** | Abstract interface, OpenAI first | Enables Anthropic/others later without rewrite |

## Phases

- [ ] **Phase 1: Config Foundation** — AppConfig model, API, defaults
- [ ] **Phase 2: LLM Provider Abstraction** — Multi-provider support, model selection
- [ ] **Phase 3: Embeddings, RAG & Tunables** — All AI config consumed from AppConfig
- [ ] **Phase 4: Settings Page UI** — Sections for LLM, embeddings, RAG, tunables

## Phase Details

### Phase 1: Config Foundation

**Goal:** Tunables stored in MongoDB; API to read/write; API keys remain in env only.

**Depends on:** Nothing (first phase)

**Requirements:** REQ-CFG-01, REQ-KEY-01

**Success Criteria** (what must be TRUE):
1. AppConfig document exists in MongoDB with schema for llm, embeddings, rag, tunables
2. GET /api/settings returns current config (with env-derived keys masked/omitted)
3. PUT /api/settings accepts partial updates and persists to MongoDB
4. All AI code can resolve config via a shared `getAppConfig()` (or equivalent)
5. API keys (OPENAI_API_KEY, VOYAGE_API_KEY) are read from env only; never stored in DB

**Plans:** TBD (suggest 2–3 plans: model + schema, API routes, config resolver)

Plans:
- [ ] 01-01: AppConfig model + Zod schema + defaults
- [ ] 01-02: GET/PUT /api/settings routes + config resolver
- [ ] 01-03: Seed initial config if collection empty

---

### Phase 2: LLM Provider Abstraction

**Goal:** Multiple providers supported; model selection from config; no hardcoded gpt-4-turbo.

**Depends on:** Phase 1

**Requirements:** REQ-LLM-01

**Success Criteria** (what must be TRUE):
1. Provider interface exists; OpenAI implementation wired to config
2. Model name read from AppConfig (e.g., llm.model)
3. All 10+ AI operations use config-driven model (script-generator, hook-generator, repurposing-engine, seo-generator, auto-tagger, virality-scorer, evergreen-scorer, planner, insight-reporter, news-research, prompt-run)
4. Changing llm.model in settings changes which model is used for generation
5. Anthropic can be added later by implementing same interface (no structural change)

**Plans:** TBD (suggest 2–3 plans: provider abstraction, OpenAI impl, refactor consumers)

Plans:
- [ ] 02-01: LLM provider interface + OpenAI implementation
- [ ] 02-02: Refactor all AI modules to use config-driven model
- [ ] 02-03: Usage logger reflects actual model used

---

### Phase 3: Embeddings, RAG & Tunables

**Goal:** Embeddings, RAG, and feature tunables read from AppConfig; no hardcoded values.

**Depends on:** Phase 1

**Requirements:** REQ-EMB-01, REQ-RAG-01, REQ-TUNE-01

**Success Criteria** (what must be TRUE):
1. Embeddings: model, dimensions, max_text_chars from config (embeddings.ts)
2. RAG: max_total_chars, excerpt_chars, numCandidates from config (rag-retrieval.ts, ai/search)
3. Repurposing: max_script_chars from config (repurposing-engine.ts)
4. Auto-tagger: max_text_chars from config (auto-tagger.ts)
5. Search: default limit and mode from config (ai/search/route.ts)
6. Changing any tunable in config changes runtime behavior without code change

**Plans:** TBD (suggest 2–3 plans: embeddings config, RAG config, tunables config)

Plans:
- [ ] 03-01: Embeddings config (model, dimensions, max_text_chars)
- [ ] 03-02: RAG config (max_total_chars, excerpt_chars, numCandidates)
- [ ] 03-03: Tunables config (repurposing, auto-tagger, search defaults)

---

### Phase 4: Settings Page UI

**Goal:** User can view and edit all AI/LLM/RAG/embeddings/tunables from Settings page.

**Depends on:** Phase 1, Phase 2, Phase 3

**Requirements:** REQ-UI-01

**Success Criteria** (what must be TRUE):
1. Settings page has distinct sections: LLM, Embeddings, RAG, Other Tunables
2. User can edit provider, model, dimensions, limits, etc. via forms
3. Save persists to MongoDB via PUT /api/settings
4. Validation prevents invalid values (e.g., limit 1–50, mode enum)
5. Publishing connections section remains (existing YouTube/TikTok)
6. User sees success/error feedback on save

**Plans:** TBD (suggest 2–3 plans: LLM section, embeddings/RAG section, tunables section)

Plans:
- [ ] 04-01: Settings page layout + LLM section (provider, model)
- [ ] 04-02: Embeddings & RAG sections
- [ ] 04-03: Other tunables section + validation + save feedback

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Config Foundation | 0/3 | Not started | - |
| 2. LLM Provider Abstraction | 0/3 | Not started | - |
| 3. Embeddings, RAG & Tunables | 0/3 | Not started | - |
| 4. Settings Page UI | 0/3 | Not started | - |

**Execution order:** 1 → 2 → 3 → 4 (Phase 3 can start after Phase 1; Phase 4 needs 2 and 3 for full UI coverage)

---

## Coverage Validation

| Configurable | Source | Phase |
|--------------|--------|-------|
| LLM provider | openai-client, 10+ consumers | 2 |
| LLM model | 10+ files (gpt-4-turbo) | 2 |
| Embeddings model | embeddings.ts (voyage-3-large) | 3 |
| Embeddings dimensions | embeddings.ts (1024) | 3 |
| Embeddings max_text_chars | embeddings.ts (8000) | 3 |
| RAG max_total_chars | rag-retrieval.ts (1500) | 3 |
| RAG excerpt_chars | rag-retrieval.ts (200) | 3 |
| RAG numCandidates | rag-retrieval.ts, ai/search | 3 |
| Repurposing max_script_chars | repurposing-engine.ts (4000) | 3 |
| Auto-tagger max_text_chars | auto-tagger.ts (500) | 3 |
| Search limit (1–50) | ai/search (default 10) | 3 |
| Search mode (vector\|hybrid) | ai/search (default vector) | 3 |

**Coverage:** 12 configurables, all mapped. No orphans.

---

## Config Schema (Draft)

```typescript
// AppConfig document structure (MongoDB)
{
  _id: ObjectId,
  llm: {
    provider: 'openai' | 'anthropic',
    model: string  // e.g. 'gpt-4-turbo', 'gpt-4o'
  },
  embeddings: {
    model: string,      // e.g. 'voyage-3-large'
    dimensions: number, // 1024
    maxTextChars: number // 8000
  },
  rag: {
    maxTotalChars: number,  // 1500
    excerptChars: number,   // 200
    numCandidatesBase: number,  // 100
    numCandidatesMultiplier: number  // 20
  },
  tunables: {
    repurposingMaxScriptChars: number,  // 4000
    autoTaggerMaxTextChars: number,     // 500
    searchDefaultLimit: number,        // 10
    searchDefaultMode: 'vector' | 'hybrid'
  },
  updatedAt: Date
}
```

Keys: OPENAI_API_KEY, VOYAGE_API_KEY (and future ANTHROPIC_API_KEY) remain in `.env` only.
