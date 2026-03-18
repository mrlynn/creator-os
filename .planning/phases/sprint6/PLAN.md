# Sprint 6: AI-Enhanced Layer

**Phase:** sprint6  
**Source:** `.planning/phases/sprint6/RESEARCH.md`  
**Implementation order:** 1 → 2 → 3 → 4 → 5 → 6 → 7

**GSD plan files (for execute-phase):**
- `sprint6-01-PLAN.md` — SEO title + description generator
- `sprint6-02-PLAN.md` — Evergreen content scorer
- `sprint6-03-PLAN.md` — AI weekly content planner
- `sprint6-04-PLAN.md` — AI weekly performance report
- `sprint6-05-PLAN.md` — Semantic idea deduplication (Sprint 5 dep)
- `sprint6-06-PLAN.md` — Embed on create (Sprint 5 dep)
- `sprint6-07-PLAN.md` — Batch embedding job (Sprint 5 dep)

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | SEO generator | Plan 01 | seo-generator.ts, /api/episodes/[id]/seo, library/[id]/page.tsx |
| 2 | Evergreen scorer | Plan 02 | evergreen-scorer.ts, /api/episodes/[id]/evergreen, Episode schema, library/[id]/page.tsx |
| 3 | Weekly planner | Plan 03 | planner.ts, /api/ai/planner, pipeline/page.tsx |
| 4 | Weekly report | Plan 04 | insight-reporter.ts, /api/ai/insight-report, analytics/page.tsx |
| 5 | Semantic dedup | Plan 05 | semantic-dedup.ts, ideas/route.ts (Sprint 5 dep) |
| 6 | Embed on create | Plan 06 | ideas/route.ts, scripts/route.ts, episodes/route.ts (Sprint 5 dep) |
| 7 | Batch embed job | Plan 07 | /api/ai/embed-batch (Sprint 5 dep) |

---

## Feature → Plan Mapping

| Requirement | Description | Plan |
|-------------|-------------|------|
| SEO-01 | SEO generator: 5 title options, description, tags | 01 |
| SEO-02 | SEO button on episode detail | 01 |
| EVER-01 | Evergreen scorer API | 02 |
| EVER-02 | Evergreen button on episode detail | 02 |
| PLAN-01 | Weekly planner API | 03 |
| PLAN-02 | Plan This Week button on Pipeline | 03 |
| REPORT-01 | Weekly performance report API | 04 |
| REPORT-02 | Generate Report button on Analytics | 04 |
| DEDUP-01 | Semantic dedup on idea create | 05 |
| EMBED-01 | Embed on create (ideas, scripts, episodes) | 06 |
| BATCH-01 | Batch embedding job API | 07 |

---

## Wave Structure

### Track A (No Sprint 5 Dependency)

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 01, 02, 03, 04 | — |

All four Track A plans are independent and can run in parallel.

### Track B (Sprint 5 Follow-On)

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 06 | sprint5-04 (embed routes) |
| 2 | 07 | sprint5-04, sprint6-06 (embed-pipeline) |
| 3 | 05 | sprint5-04, sprint5-05 (embed + semantic search) |

- **Plan 06:** Requires embed API routes; creates embed-pipeline.ts.
- **Plan 07:** Requires Plan 06 (embed-pipeline); runs after 06.
- **Plan 05:** Requires semantic search API ($vectorSearch) for dedup; runs last.

---

## Implementation Order (Incremental Commits)

1. **Plan 01** — SEO generator  
   - Commit: `feat(sprint6): add SEO title + description generator`

2. **Plan 02** — Evergreen scorer  
   - Commit: `feat(sprint6): add evergreen content scorer`

3. **Plan 03** — Weekly planner  
   - Commit: `feat(sprint6): add AI weekly content planner`

4. **Plan 04** — Weekly report  
   - Commit: `feat(sprint6): add AI weekly performance report`

5. **Plan 05** — Semantic dedup (Sprint 5 required)  
   - Commit: `feat(sprint6): add semantic idea deduplication on create`

6. **Plan 06** — Embed on create (Sprint 5 required)  
   - Commit: `feat(sprint6): add embed-on-create for ideas, scripts, episodes`

7. **Plan 07** — Batch embed job (Sprint 5 required)  
   - Commit: `feat(sprint6): add batch embedding job API`

---

## Key Interfaces (for executor reference)

### Script extraction (reuse from repurpose, auto-tagger)
```javascript
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const scriptText = sections.filter(Boolean).join('\n\n');
```

### Existing patterns
- `connectToDatabase()` before DB ops
- `getServerSession()` for auth
- `logAiUsage({ category, tokensUsed, durationMs, success })` fire-and-forget
- AiUsageLog categories: `seo-generation` (exists), add `evergreen-scoring`, `planner`, `insight-report` if needed

### Episode tags
- Episode.tags are ObjectIds; populate and pass tag names to SEO prompt.

---

## Verification Summary

| Plan | Automated | Manual |
|------|-----------|--------|
| 01 | `npm run build`, API curl | SEO button returns titles, description, tags |
| 02 | `npm run build`, API curl | Evergreen button returns score 0–100 |
| 03 | `npm run build`, API curl | Plan This Week returns youtube/tiktok arrays |
| 04 | `npm run build`, API curl | Generate Report returns headline, wins, recommendations |
| 05 | `npm run build` | Create similar idea → duplicate warning |
| 06 | `npm run build` | Create idea → embedding in DB shortly after |
| 07 | `npm run build`, API curl | POST embed-batch returns processed count |
