---
phase: sprint7
plan: 05
subsystem: api
tags: [RAG, semantic search, script-gen, hook-gen, repurpose, SEO, prompt-run]

# Dependency graph
requires:
  - phase: sprint5
    provides: embeddings, vector indexes
provides:
  - getRagContext(query, types, limit) helper
  - includeRag/ragLimit on script-gen, hook-gen, repurpose, SEO, prompt-run
affects: [script-generator, hook-generator, repurposing-engine, seo-generator, prompt-run]

# Tech tracking
tech-stack:
  added: [rag-retrieval.ts]
  patterns: [RAG context injection into system/user prompts]

key-files:
  created: [src/lib/ai/rag-retrieval.ts]
  modified: [src/lib/ai/script-generator.ts, src/lib/ai/hook-generator.ts, src/lib/ai/repurposing-engine.ts, src/lib/ai/seo-generator.ts, src/app/api/scripts/[id]/generate/route.ts, src/app/api/scripts/[id]/hooks/route.ts, src/app/api/episodes/[id]/repurpose/route.ts, src/app/api/episodes/[id]/seo/route.ts, src/app/api/prompts/[id]/run/route.ts, src/lib/db/schemas.ts]

key-decisions:
  - "RAG context appended to system prompt (script-gen, repurpose, seo) or user prompt (hook-gen, prompt-run)"
  - "~1500 chars max total, ~200 chars per excerpt"

patterns-established:
  - "getRagContext: embed query, $vectorSearch per type, merge by score, format as bullet list"

requirements-completed: [RAG-01, RAG-02]

# Metrics
duration: ~15min
completed: 2026-03-18
---

# Phase sprint7 Plan 05: RAG Summary

**RAG context retrieval via getRagContext, integrated into script-gen, hook-gen, repurpose, SEO, prompt-run**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Created `getRagContext(query, types, limit)` in rag-retrieval.ts
- Vector search across idea/episode/script, merge by score, format "Relevant past content for context:\n\n- [title]: [excerpt]"
- Total output capped at ~1500 chars, excerpt ~200 chars
- Added includeRag, ragLimit to GenerateScriptSchema, GenerateHooksSchema
- Integrated into script-generator (system), hook-generator (user), repurposing-engine (system), seo-generator (system), prompt-run (user)
- All routes parse includeRag, ragLimit from body and pass to AI libs

## Task Commits

1. **Task 1: Create getRagContext helper** - part of `0560baf`
2. **Task 2: Integrate RAG into script-gen, hook-gen, prompt-run, repurpose, SEO** - `0560baf` (feat)

## Files Created/Modified

- `src/lib/ai/rag-retrieval.ts` - getRagContext, vector search, formatting
- `src/lib/ai/script-generator.ts` - includeRag/ragLimit, append to system prompt
- `src/lib/ai/hook-generator.ts` - includeRag/ragLimit, append to user prompt
- `src/lib/ai/repurposing-engine.ts` - includeRag/ragLimit, append to system prompt
- `src/lib/ai/seo-generator.ts` - includeRag/ragLimit, append to system prompt
- `src/app/api/scripts/[id]/generate/route.ts` - pass includeRag, ragLimit
- `src/app/api/scripts/[id]/hooks/route.ts` - pass includeRag, ragLimit
- `src/app/api/episodes/[id]/repurpose/route.ts` - pass includeRag, ragLimit
- `src/app/api/episodes/[id]/seo/route.ts` - pass includeRag, ragLimit
- `src/app/api/prompts/[id]/run/route.ts` - parse includeRag, ragLimit, append to user message
- `src/lib/db/schemas.ts` - includeRag, ragLimit on GenerateScriptSchema, GenerateHooksSchema

## Decisions Made

- RAG optional; no impact when includeRag false/omitted
- Context truncated to avoid overflow (~1500 chars total)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- RAG ready for UI toggles (includeRag checkbox, ragLimit input)
- Requires Sprint 5: embedding fields, vector indexes

---
*Phase: sprint7*
*Completed: 2026-03-18*
