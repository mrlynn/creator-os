# Sprint 6: AI-Enhanced Layer — Research

**Researched:** 2026-03-18  
**Domain:** AI content generation (SEO, weekly planner, weekly report, evergreen scorer), semantic deduplication, embedding pipeline follow-ons  
**Confidence:** HIGH

## Summary

Sprint 6 delivers the **AI-Enhanced Layer** from the PRD V2: features that either build on Sprint 5 vector search or stand alone. **In-scope (no Sprint 5 dependency):** SEO title + description generator (Prompt 6), AI weekly content planner (Prompt 9), AI weekly performance report (Prompt 10), Evergreen content scorer. **In-scope (Sprint 5 follow-on):** Semantic idea deduplication, batch embedding job, embed on create. **Deferred:** Custom instruction profiles (lower ROI, can follow later), hybrid search, RAG for AI Toolkit.

**Primary recommendation:** Implement SEO generator, weekly planner, weekly report, and evergreen scorer in Sprint 6. If Sprint 5 is complete, add semantic deduplication and embed-on-create. Defer custom instruction profiles to a later sprint.

---

## Recommended Sprint 6 Scope

### In Scope (Core — No Sprint 5 Dependency)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 1 | **SEO title + description generator** | Small | PRD Prompt 6; Episode + Script exist; `/api/episodes/[id]/repurpose` pattern; high ROI "20 min/video" |
| 2 | **AI weekly content planner** | Medium | PRD Prompt 9; Ideas with virality scores exist; Pipeline page natural home; "1 hr/week" saved |
| 3 | **AI weekly performance report** | Medium | PRD Prompt 10; AnalyticsSnapshot + Episode exist; Analytics page natural home; "1 hr/week" saved |
| 4 | **Evergreen content scorer** | Small | PRD; Episode + Script; GPT-4 classification; surfaces repurposing candidates |

### In Scope (Sprint 5 Follow-On — Requires Sprint 5 Complete)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 5 | **Semantic idea deduplication** | Small | On idea create: embed, $vectorSearch for similar; flag if cosine > 0.85 |
| 6 | **Embed on create (fire-and-forget)** | Small | After idea/episode/script create, trigger embed in background |
| 7 | **Batch embedding job** | Small | POST `/api/ai/embed-batch` or cron; embed documents missing embeddings |

### Follow-On (If Time Permits)

| Feature | Effort | Rationale |
|---------|--------|-----------|
| Custom instruction profiles | Medium | Persona-based system prompts; Prompt library exists; lower immediate ROI |

### Deferred

| Feature | Reason |
|---------|--------|
| Hybrid search (vector + full-text) | Sprint 5 deferred; requires Atlas Search text index |
| RAG for AI Toolkit | Different use case; semantic search is foundation |
| Custom instruction profiles | Can ship in Sprint 7 if Sprint 6 is full |

---

## Architecture & Data Flow

### Feature 1: SEO Title + Description Generator (Prompt 6)

**PRD Prompt 6 (verbatim):**
```
You are a YouTube SEO specialist for developer and AI education content.
Video working title: {{title}}
Key topics covered: {{tags}}
Script summary or first 500 words: {{script}}

Generate:
1. TITLE OPTIONS (5 variations): keyword-first, curiosity-gap, specific/numerical, pain-point, authority
2. DESCRIPTION: first 2 lines, full 300–500 words, timestamps placeholder, links section
3. Tags list: 15–20 YouTube tags

Return as JSON: { titles, recommendedTitle, description, tags }
```

**Data flow:**
- Episode detail page → "Generate SEO" button → POST `/api/episodes/[id]/seo`
- Fetch Episode with scriptId populated; build script text from sections (same as repurpose)
- `seo-generator.ts`: GPT-4 with Prompt 6; parse JSON; return `{ titles, recommendedTitle, description, tags }`
- Optionally persist to Episode (add `aiMetadata.seoTitle`, `aiMetadata.seoDescription` if schema extended)

**Model change (optional):** Episode schema could add:
```javascript
aiMetadata: {
  seoTitle: String,
  seoDescription: String,
  seoTags: [String],
}
```
Or return only in API response; UI copies to clipboard. PRD says "on demand" — start with API response only.

**Existing code to reuse:**
- `src/app/api/episodes/[id]/repurpose/route.ts` — Episode fetch, script extraction
- `src/lib/ai/repurposing-engine.ts` — section extraction pattern
- `logAiUsage` category `'seo-generation'` (already in AiUsageLog)

**File paths:**
- `src/lib/ai/seo-generator.ts` — `generateSeo(episode: { title, scriptText, tags })`
- `src/app/api/episodes/[id]/seo/route.ts` — POST handler

---

### Feature 2: AI Weekly Content Planner (Prompt 9)

**PRD Prompt 9 (verbatim):**
```
You are a content calendar strategist for a developer advocate.
Publishing targets: 3 YouTube videos/week + 5 TikToks/week
Week of: {{weekOf}}
Available ideas in backlog: {{ideas}}
Recently published: {{publishedRecently}}

Create optimal week plan:
- youtube: [{ day, ideaId, title, rationale }, ...]
- tiktok: [{ day, ideaId, title, derivedFrom }, ...]
- warnings: ["backlog thin on beginner content", ...]
- suggestedNewIdeas: ["gap I noticed...", ...]
```

**Data flow:**
- Pipeline page → "Plan This Week" button → POST `/api/ai/planner` with `{ weekOf?: string }`
- Fetch: ContentIdea with status `raw` or `validated`, viralityScore; Episode with publishedAt in last 2 weeks
- Build `ideas` string: `title | audience | platform | viralityScore`
- Build `publishedRecently` string: episode titles
- `planner.ts`: GPT-4 with Prompt 9; parse JSON; return plan
- UI: display plan in modal or expandable section; user can copy or manually schedule

**Existing code to reuse:**
- `ContentIdea` model: viralityScore, viralityReasoning, platform, audience
- `Episode` model: publishedAt (or use publishingRecords); need to map episodes to ideas
- Pipeline page: `src/app/app/pipeline/page.tsx` — add "Plan This Week" button

**File paths:**
- `src/lib/ai/planner.ts` — `generateWeeklyPlan(ideas, publishedRecently, weekOf)`
- `src/app/api/ai/planner/route.ts` — POST handler

**Edge case:** No ideas in backlog → return empty plan with warning "Create more ideas to get recommendations"

---

### Feature 3: AI Weekly Performance Report (Prompt 10)

**PRD Prompt 10 (verbatim):**
```
You are a content analytics advisor for developer education creator.
Week of: {{weekOf}}
This week's performance data: {{metricsData}}
Previous week for comparison: {{previousWeekData}}

Generate:
1. HEADLINE METRIC
2. WINS (2–3)
3. UNDERPERFORMERS (1–2)
4. PATTERNS
5. NEXT WEEK RECOMMENDATIONS (3 specific actions)
6. MOMENTUM SCORE (1–10)

Return JSON: { headline, wins, underperformers, patterns, recommendations, momentumScore }
```

**Data flow:**
- Analytics page → "Generate Weekly Report" button → POST `/api/ai/insight-report` with `{ weekOf?: string }`
- Fetch AnalyticsSnapshot for weekOf (and previous week); group by episode; build metrics summary
- `insight-reporter.ts`: GPT-4 with Prompt 10; parse JSON; return report
- UI: display in expandable section or modal

**Data shape for prompt:**
- `metricsData`: e.g. "Episode X: 1.2K views, 45 likes, 12 comments, 3.2% engagement"
- `previousWeekData`: same format for prior week
- Need to aggregate snapshots by episode and by week

**Existing code to reuse:**
- `AnalyticsSnapshot`: episodeId, platform, snapshotDate, viewCount, likeCount, commentCount, shareCount, engagement
- `Episode`: populate for titles
- Analytics page: `src/app/app/analytics/page.tsx` — add "Generate Report" button

**File paths:**
- `src/lib/ai/insight-reporter.ts` — `generateWeeklyReport(metricsData, previousWeekData, weekOf)`
- `src/app/api/ai/insight-report/route.ts` — POST handler

**Edge case:** No snapshots → return message "Add analytics snapshots to generate reports"

---

### Feature 4: Evergreen Content Scorer

**PRD:** "Evergreen score (0–100): AI rates content longevity based on topic stability and search intent"

**Data flow:**
- Episode detail or Library → "Score Evergreen" button → POST `/api/episodes/[id]/evergreen`
- Fetch Episode with scriptId populated; build text from title + script
- `evergreen-scorer.ts`: GPT-4 classification; return `{ evergreenScore: 0–100, reasoning: string }`
- Persist to Episode: add `aiMetadata.evergreenScore`, `aiMetadata.evergreenReasoning` (schema change)

**Model change:** Episode schema:
```javascript
aiMetadata: {
  evergreenScore: Number,
  evergreenReasoning: String,
}
```

**Prompt (derived from PRD):**
- Input: episode title + script summary (first 500 chars)
- Output: JSON `{ evergreenScore: number, reasoning: string }`
- Consider: topic stability (does it date quickly?), search intent (evergreen queries?), tutorial vs news

**File paths:**
- `src/lib/ai/evergreen-scorer.ts` — `scoreEvergreen(episode)`
- `src/app/api/episodes/[id]/evergreen/route.ts` — POST handler

**AiUsageLog:** Add `'evergreen-scoring'` category or use `'other'`; recommend adding category.

---

### Feature 5: Semantic Idea Deduplication (Sprint 5 Dependency)

**Requires:** Sprint 5 embedding pipeline, Voyage client, ContentIdea.embedding, Atlas vector index

**Data flow:**
- On ContentIdea POST (create): after save, fire-and-forget `checkSemanticDuplicates(ideaId)`
- `checkSemanticDuplicates`: embed new idea (title + description); run $vectorSearch on contentideas excluding self; if top result cosine > 0.85, set `aiMetadata.semanticDuplicateOf` or `aiMetadata.duplicateWarning: true` + similar idea IDs
- UI: Idea detail or list shows "Similar to: [link]" if flagged

**Model change:** ContentIdea:
```javascript
aiMetadata: {
  duplicateWarning: Boolean,
  similarIdeaIds: [ObjectId],
}
```

**File paths:**
- `src/lib/ai/semantic-dedup.ts` — `checkSemanticDuplicates(ideaId)`
- Hook in `src/app/api/ideas/route.ts` POST: `checkSemanticDuplicates(idea._id).catch(console.error)`

---

### Feature 6: Embed on Create (Sprint 5 Dependency)

**Requires:** Sprint 5 embed pipeline (`/api/ideas/[id]/embed`, etc.), `embed()` from embeddings.ts

**Data flow:**
- After ContentIdea POST: `embedIdea(ideaId).catch(console.error)`
- After Script POST: `embedScript(scriptId).catch(console.error)`
- After Episode POST: `embedEpisode(episodeId).catch(console.error)`
- Each calls existing embed route logic or shared `embedDocument(type, id)` helper

**File paths:**
- `src/lib/ai/embed-pipeline.ts` — `embedIdea(id)`, `embedScript(id)`, `embedEpisode(id)` (or reuse route handlers internally)
- Hook in ideas/route.ts, scripts/route.ts, episodes/route.ts

---

### Feature 7: Batch Embedding Job (Sprint 5 Dependency)

**Data flow:**
- POST `/api/ai/embed-batch` with `{ types?: ['idea','script','episode'], limit?: 50 }`
- Query each collection for documents where `embedding` is null or missing
- For each (up to limit): call embed, save
- Return `{ processed: number, failed: number, errors: string[] }`
- Optional: Vercel cron or external cron to hit this route weekly

**File paths:**
- `src/app/api/ai/embed-batch/route.ts` — POST handler

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
| voyageai | ^0.2.1 | Embeddings for dedup, batch |

---

## Architecture Patterns

### AI Module Pattern (Existing)
- `src/lib/ai/*.ts`: `getOpenAIClient()`, `logAiUsage()`, return `{ success, data/error, tokensUsed?, durationMs? }`
- See `virality-scorer.ts`, `repurposing-engine.ts`, `auto-tagger.ts`

### API Route Pattern (Existing)
- `connectToDatabase()` from `@/lib/db/connection`
- `getServerSession()` from `@/lib/auth`
- Zod validation for request body
- `Response.json()` with status codes

### Script Text Extraction (Reuse)
```javascript
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const scriptText = sections.filter(Boolean).join('\n\n');
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| JSON parsing from GPT | Manual regex | `JSON.parse` with try/catch; strip ```json if needed |
| Week date handling | Custom logic | `new Date()` with ISO string; `weekOf` as YYYY-MM-DD of Monday |
| Embedding (Sprint 5) | Custom model | Voyage AI via Sprint 5 embeddings module |

---

## Common Pitfalls

### SEO Generator
- **Empty script:** Episode has scriptId but script empty. Use title + description only; or return error.
- **Tags format:** Episode.tags are ObjectIds; need to populate and pass tag names to prompt.

### Weekly Planner
- **Idea format mismatch:** PRD expects `ideaId` in output; ensure ideas have `_id` for linking.
- **Published recently:** Episodes may not have `publishedAt`; use PublishingRecord.publishedAt or Episode.updatedAt as proxy.

### Weekly Report
- **Sparse snapshots:** Few snapshots → report may be thin. Handle gracefully.
- **Week boundaries:** Define "this week" as last 7 days or calendar week; document in API.

### Evergreen Scorer
- **Schema migration:** Add aiMetadata to Episode; existing episodes have no aiMetadata — use optional chaining.

### Semantic Dedup (Sprint 5)
- **New idea has no embedding yet:** Run embed first, then search. Order: save idea → embed (async) → when embed done, run $vectorSearch.
- **Threshold tuning:** 0.85 cosine = fairly similar; 0.9 = very similar. Start with 0.85.

---

## Existing Code to Reuse

| Asset | Location | Use |
|-------|----------|-----|
| Episode + script fetch | `src/app/api/episodes/[id]/repurpose/route.ts` | Script extraction for SEO, evergreen |
| Virality scorer pattern | `src/lib/ai/virality-scorer.ts` | JSON structured output, logAiUsage |
| Repurposing engine | `src/lib/ai/repurposing-engine.ts` | Section extraction, JSON parse |
| Auto-tagger | `src/lib/ai/auto-tagger.ts` | Script text from Episode |
| Ideas API | `src/app/api/ideas/route.ts` | Idea list for planner |
| Episodes API | `src/app/api/episodes/route.ts` | Episode list, embed hook |
| Analytics snapshots | `src/app/api/analytics-snapshots/route.ts` | Metrics for report |
| Episode detail page | `src/app/app/library/[id]/page.tsx` | SEO button, Evergreen button |
| Pipeline page | `src/app/app/pipeline/page.tsx` | Plan This Week button |
| Analytics page | `src/app/app/analytics/page.tsx` | Generate Report button |

---

## Dependencies on Sprint 5

| Sprint 6 Feature | Sprint 5 Required? | Notes |
|------------------|-------------------|-------|
| SEO generator | No | Standalone |
| Weekly planner | No | Uses ContentIdea, Episode |
| Weekly report | No | Uses AnalyticsSnapshot |
| Evergreen scorer | No | Standalone |
| Semantic dedup | **Yes** | Needs embed, $vectorSearch |
| Embed on create | **Yes** | Needs embed pipeline |
| Batch embed job | **Yes** | Needs embed pipeline |

**Recommendation:** Implement SEO, planner, report, evergreen first. If Sprint 5 is done, add dedup + embed-on-create + batch in same sprint or as quick follow-on.

---

## Verification Steps

1. **SEO:** Create episode with script; POST `/api/episodes/[id]/seo` → returns titles, description, tags
2. **Planner:** Have 5+ ideas with virality scores; POST `/api/ai/planner` → returns youtube/tiktok arrays
3. **Report:** Add 2+ analytics snapshots; POST `/api/ai/insight-report` → returns headline, wins, recommendations
4. **Evergreen:** POST `/api/episodes/[id]/evergreen` → returns score 0–100, reasoning
5. **Dedup (Sprint 5):** Create idea similar to existing; verify duplicate warning appears
6. **Embed on create (Sprint 5):** Create idea; verify embedding exists in DB shortly after

---

## Model Changes Summary

| Model | Change |
|-------|--------|
| Episode | Add `aiMetadata: { seoTitle?, seoDescription?, seoTags?, evergreenScore?, evergreenReasoning? }` (optional) |
| ContentIdea | Add `aiMetadata: { duplicateWarning?, similarIdeaIds? }` (Sprint 5 follow-on) |
| AiUsageLog | Add `'evergreen-scoring'`, `'planner'`, `'insight-report'` categories if not using `'other'` |

---

## Suggested Implementation Order

1. **SEO generator** — seo-generator.ts, POST /api/episodes/[id]/seo, button on episode detail
2. **Evergreen scorer** — evergreen-scorer.ts, POST /api/episodes/[id]/evergreen, Episode schema, button
3. **Weekly planner** — planner.ts, POST /api/ai/planner, Pipeline "Plan This Week" button
4. **Weekly report** — insight-reporter.ts, POST /api/ai/insight-report, Analytics "Generate Report" button
5. **(If Sprint 5 done)** Semantic dedup — semantic-dedup.ts, hook in ideas POST
6. **(If Sprint 5 done)** Embed on create — hook in ideas, scripts, episodes POST
7. **(If Sprint 5 done)** Batch embed — POST /api/ai/embed-batch

---

## Phase Requirements (Sprint 6)

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | SEO generator: 5 title options, description, tags | PRD Prompt 6; repurpose pattern |
| SEO-02 | SEO button on episode detail | Library [id] page |
| PLAN-01 | Weekly planner API | PRD Prompt 9; Ideas, Episodes |
| PLAN-02 | Plan This Week button on Pipeline | Pipeline page |
| REPORT-01 | Weekly performance report API | PRD Prompt 10; AnalyticsSnapshot |
| REPORT-02 | Generate Report button on Analytics | Analytics page |
| EVER-01 | Evergreen scorer API | PRD; Episode + Script |
| EVER-02 | Evergreen button on episode detail | Library [id] page |
| DEDUP-01 | Semantic dedup on idea create | Sprint 5 embed + $vectorSearch |
| EMBED-01 | Embed on create (ideas, scripts, episodes) | Sprint 5 embed pipeline |
| BATCH-01 | Batch embedding job API | Sprint 5 embed pipeline |

---

## Sources

### Primary (HIGH confidence)
- Creator OS codebase: models, APIs, repurpose, virality-scorer, auto-tagger
- PRD.md: Prompts 6, 9, 10; AI Integration Opportunity Matrix; V2 features
- Sprint 5 RESEARCH.md: embedding pipeline, vector search

### Secondary (MEDIUM confidence)
- Sprint 4 RESEARCH.md: repurposing, prompt library patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing
- Architecture: HIGH — patterns established in Sprints 2–5
- Pitfalls: MEDIUM — edge cases identified from codebase review

**Research date:** 2026-03-18  
**Valid until:** ~30 days
