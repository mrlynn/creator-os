# Settings & AI Configuration — Requirements

**Initiative:** Comprehensive Settings page for Creator OS  
**Scope:** AI/LLM, embeddings, RAG, and tunables configuration  
**Last updated:** 2026-03-19

## Requirements

### LLM (REQ-LLM-01)
Support multiple providers (OpenAI, future: Anthropic) and model selection. Replace hardcoded `gpt-4-turbo` across all AI operations.

**Configurables:**
- Provider (openai, anthropic)
- Model name (e.g., gpt-4-turbo, gpt-4o, claude-3-opus)

**Affected files:** script-generator, hook-generator, repurposing-engine, seo-generator, auto-tagger, virality-scorer, evergreen-scorer, planner, insight-reporter, news-research, prompt-run

### Embeddings (REQ-EMB-01)
Expose embeddings configuration in settings. Replace hardcoded Voyage AI values.

**Configurables:**
- Model (e.g., voyage-3-large)
- Output dimensions (1024)
- Max text chars (8000)

**Affected files:** embeddings.ts

### RAG (REQ-RAG-01)
Expose RAG retrieval configuration in settings.

**Configurables:**
- Max total chars (1500)
- Excerpt chars (200)
- Num candidates multiplier (e.g., max(100, limit*20))

**Affected files:** rag-retrieval.ts, ai/search/route.ts

### Other Tunables (REQ-TUNE-01)
Expose feature-specific limits and defaults.

**Configurables:**
- Repurposing: max script chars (4000)
- Auto-tagger: max text chars (500)
- Search: default limit (1–50), default mode (vector|hybrid)

**Affected files:** repurposing-engine.ts, auto-tagger.ts, ai/search/route.ts

### Settings UI (REQ-UI-01)
Settings page exposes all AI/LLM/RAG/embeddings/tunables. User can view and edit from `/app/settings`.

**Sections:**
- LLM (provider, model)
- Embeddings (model, dimensions, max chars)
- RAG (max total chars, excerpt chars, candidates)
- Other tunables (repurposing, auto-tagger, search defaults)

### Config Storage (REQ-CFG-01)
- **Tunables:** MongoDB (AppConfig or similar) — editable at runtime
- **API keys:** Environment variables only — never stored in DB
- **Scope:** Global (single-tenant); no per-user settings for v1

### API Key Handling (REQ-KEY-01)
- OpenAI, Voyage, etc.: keys from `process.env` only
- No user-provided keys in DB for v1 (security)
- Future: optional user override could be added with encryption

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-CFG-01 | Phase 1 | Pending |
| REQ-KEY-01 | Phase 1 | Pending |
| REQ-LLM-01 | Phase 2 | Pending |
| REQ-EMB-01 | Phase 3 | Pending |
| REQ-RAG-01 | Phase 3 | Pending |
| REQ-TUNE-01 | Phase 3 | Pending |
| REQ-UI-01 | Phase 4 | Pending |

**Coverage:** 7 requirements, 4 phases, 100% mapped.
