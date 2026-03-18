# Sprint 5: Atlas Vector Search + Semantic Search

**Phase:** sprint5  
**Source:** `.planning/phases/sprint5/RESEARCH.md`  
**Implementation order:** 2 → 3 → 4 → 5 → 6 (plan 01 DONE — skip)

**GSD plan files (for execute-phase):**
- ~~`sprint5-01-PLAN.md`~~ — **DONE** — Voyage AI client + embeddings module (embeddings.ts exists)
- `sprint5-02-PLAN.md` — Schema changes (embedding field)
- `sprint5-03-PLAN.md` — Atlas Vector Search indexes (runbook)
- `sprint5-04-PLAN.md` — Embed API routes
- `sprint5-05-PLAN.md` — Semantic search API
- `sprint5-06-PLAN.md` — SemanticSearchBar on Library page

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | Voyage AI client + embeddings | Plan 01 | embeddings.ts, usage-logger.ts, AiUsageLog.ts |
| 2 | Schema: embedding field | Plan 02 | ContentIdea.ts, Script.ts, Episode.ts |
| 3 | Atlas vector indexes | Plan 03 | docs/runbook/ATLAS_VECTOR_INDEXES.md |
| 4 | Embed API routes | Plan 04 | /api/ideas/[id]/embed, /api/scripts/[id]/embed, /api/episodes/[id]/embed |
| 5 | Semantic search API | Plan 05 | /api/ai/search |
| 6 | SemanticSearchBar | Plan 06 | SemanticSearchBar.tsx, library/page.tsx |

---

## Feature → Plan Mapping

| Requirement | Description | Plan |
|-------------|-------------|------|
| VEC-01 | Voyage AI client + embed(text, inputType) | 01 |
| VEC-02 | embedding field on ContentIdea, Script, Episode | 02 |
| VEC-03 | Atlas vector indexes (contentideas, episodes, scripts) | 03 |
| VEC-04 | POST /api/ideas/[id]/embed, scripts, episodes | 04 |
| VEC-05 | POST /api/ai/search — semantic search | 05 |
| VEC-06 | SemanticSearchBar on Library page | 06 |

---

## Wave Structure

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 02, 03 | — |
| 2 | 04, 05 | 02 (04); 02, 03 (05) |
| 3 | 06 | 05 |

*Plan 01 (embeddings) is DONE — embeddings.ts, usage-logger, AiUsageLog already have embedding support.*

---

## Implementation Order (Incremental Commits)

1. ~~**Plan 01**~~ — **DONE** — Voyage client + embeddings (embeddings.ts exists)
   - Skip

2. **Plan 02** — Schema changes
   - Commit: `feat(sprint5): add embedding field to ContentIdea, Script, Episode`

3. **Plan 03** — Atlas indexes runbook
   - Commit: `docs(sprint5): add Atlas Vector Search index runbook`

4. **Plan 04** — Embed API routes
   - Commit: `feat(sprint5): add POST /api/ideas|scripts|episodes/[id]/embed`

5. **Plan 05** — Semantic search API
   - Commit: `feat(sprint5): add POST /api/ai/search`

6. **Plan 06** — SemanticSearchBar
   - Commit: `feat(sprint5): add SemanticSearchBar on Library page`

---

## Key Interfaces (for executor reference)

### Text extraction (reuse from auto-tagger, repurposing-engine)
```javascript
// Script
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const scriptText = sections.filter(Boolean).join('\n\n');

// ContentIdea
const text = `${idea.title}\n\n${idea.description}`.trim();

// Episode (with populated scriptId)
const fullText = `${episode.title}\n\n${episode.description || ''}\n\n${scriptText}`.trim();
// Truncate to ~8K chars if needed
```

### Existing patterns
- `connectToDatabase()` before DB ops
- `getServerSession()` for auth
- `logAiUsage({ category, tokensUsed, durationMs, success })` fire-and-forget
- `embedding` field: `select: false`; use `.select('+embedding')` only when updating

---

## Verification Summary

| Plan | Automated | Manual |
|------|-----------|--------|
| 01 | `npm run build` | embed("test") returns 1024-dim array |
| 02 | `npm run build` | — |
| 03 | — | Create indexes in Atlas UI per runbook |
| 04 | `npm run build`, API curl | POST embed returns 200 |
| 05 | `npm run build`, API curl | Search returns ideas/episodes/scripts |
| 06 | `npm run build` | Library page search flow |
