# Sprint 4: Repurposing, Vector Search, Prompt Library, Heatmap, Auto-Tagging — Research

**Researched:** 2026-03-18  
**Domain:** AI content repurposing, Voyage embeddings, MongoDB Atlas Vector Search, prompt templating, analytics aggregation  
**Confidence:** HIGH

## Summary

Sprint 4 delivers four features that build on Sprint 3's Content Library, episode detail, tags, and analytics: **Repurposing engine** (YouTube script → TikTok clip concepts), **Prompt library + runner** (saved prompts with `{{variable}}` slots), **Topic performance heatmap** (tag-based engagement analytics), and **Auto-tagging on ingest** (GPT-4 classification when episode created). **Atlas Vector Search** is deferred to Sprint 5 due to new infra (Voyage client, embedding pipeline, schema changes, index creation). Recommended implementation order: Repurposing → Prompt library → Auto-tagging → Heatmap. Repurposing and Prompt library have full PRD prompt specs; heatmap and auto-tagging reuse existing analytics/tags.

**Primary recommendation:** Implement Repurposing, Prompt library, Auto-tagging, and Topic heatmap in Sprint 4. Defer Atlas Vector Search to Sprint 5.

---

## Recommended Sprint 4 Scope

### In Scope (4 features)

| # | Feature | Effort | Rationale |
|---|---------|--------|-----------|
| 1 | **Repurposing engine** | Medium | Content Library + episode detail exist. PRD Prompt 5 specifies full prompt. Script content available via `scriptId` populate. High ROI: "One YouTube video becomes 3–5 TikToks." |
| 2 | **Prompt library + runner** | Medium | New Prompt model; `{{variable}}` templating; run panel. PRD specifies `/app/ai-toolkit`, Prompt 5–10. Reusable for other AI ops. |
| 3 | **Auto-tagging on ingest** | Small | Episode create flow exists. GPT-4 classification → tag IDs. Tag model + TagSelector exist. Fire-and-forget or async after create. |
| 4 | **Topic performance heatmap** | Medium | AnalyticsSnapshot + Episode tags exist. Aggregate by tag (topic cluster proxy); derive engagement from snapshots. |

### Deferred to Sprint 5

| Feature | Reason |
|---------|--------|
| Atlas Vector Search + semantic search | Requires: Voyage AI client, `embedding` field on ContentIdea/Episode/Script, index creation in Atlas, embedding pipeline. New infra; PRD specifies 1024-dim Voyage embeddings. |

---

## Architecture & Data Flow

### Feature 1: Repurposing Engine

**Data flow:**
- `Episode` → `scriptId` (populated) → Script with `hook`, `problem`, `solution`, `demo`, `cta`, `outro`
- Build full script text: `[hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')`
- POST `/api/episodes/[id]/repurpose` with optional `{ platform: 'tiktok' }`
- `repurposing-engine.ts`: GPT-4 with PRD Prompt 5; parse JSON response; return clip concepts
- Response: `{ clips: [{ clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone }] }`

**PRD Prompt 5 (verbatim):**
```
You are a content repurposing specialist for developer education channels.
Original YouTube script for "{{title}}":
---
{{script}}
---
Target platform for clips: {{platform}}

Identify 4–6 self-contained moments... Return a JSON array:
{ clipNumber, conceptTitle, originalSection, estimatedDuration, newHook, script, onScreenTextSuggestions, whyItStandsAlone }
```

**UI:**
- Episode detail page: add "Repurpose" button
- Modal or expandable section: show clips, copy hooks/scripts
- Reuse: `src/app/app/library/[id]/page.tsx` — add Button + dialog

**Existing code to reuse:**
- Episode API GET with populate scriptId
- Script model: `hook`, `problem`, `solution`, `demo`, `cta`, `outro`
- `logAiUsage` with category `'repurposing'`
- `getOpenAIClient()` from `openai-client.ts`

**Technical approach:**
- New `src/lib/ai/repurposing-engine.ts`: `generateClipConcepts(script: string, title: string, platform?: string)`
- `response_format: { type: 'json_object' }` for structured output
- Handle JSON parse errors; return partial on failure

---

### Feature 2: Prompt Library + Runner

**Data flow:**
- New `Prompt` model: `name`, `template` (string with `{{variable}}` slots), `variables` (array of var names), `category?`
- CRUD: `/api/prompts` GET, POST; `/api/prompts/[id]` GET, PUT, DELETE
- Run: POST `/api/prompts/[id]/run` with `{ variables: { title: "...", script: "..." } }` → fill template, call GPT-4, return output
- Copy output to clipboard in UI

**UI:**
- `/app/ai-toolkit` — list prompts, create new
- `/app/ai-toolkit/runner` or `/app/ai-toolkit/[id]` — run panel: variable inputs, Execute, output preview, Copy
- Extract variables from template: regex `/\{\{(\w+)\}\}/g`

**Existing code to reuse:**
- `getOpenAIClient()`, `logAiUsage`
- Pattern: `src/app/api/series/route.ts` for CRUD
- `AiUsageLog` category: add `'prompt-run'` or use `'other'`

**Technical approach:**
- Template fill: `template.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? '')`
- Run: single completion; no structured output unless prompt specifies
- Store prompts in MongoDB; no file-based storage

---

### Feature 3: Auto-Tagging on Ingest

**Data flow:**
- Episode POST creates episode
- After create: fire-and-forget call to `auto-tag-episode(episodeId)`
- `auto-tag-episode`: fetch episode with scriptId populated; build text from script + title; GPT-4 classification prompt → return tag names (e.g. "mongodb", "rag", "beginner")
- Match tag names to Tag model (slug or name); create tags if not exist; update episode with tags

**Classification prompt (derived from PRD):**
- Input: episode title + script summary (first 500 chars or full if short)
- Output: JSON array of tag names: `["mongodb", "rag", "beginner"]`
- Map to existing tags; create new tags with category `topic` if missing

**Existing code to reuse:**
- Episode API POST; add `await autoTagEpisode(episode._id)` after create (fire-and-forget)
- Tag model, Tag CRUD; `slug` from name: `name.toLowerCase().replace(/\s+/g, '-')`
- `logAiUsage` category `'tagging'`

**Technical approach:**
- New `src/lib/ai/auto-tagger.ts`: `autoTagEpisode(episodeId: string)`
- Fetch episode; populate scriptId; build text from script sections
- GPT-4: "Classify this content. Return JSON array of tag names (topics, technologies, audience)."
- Find or create tags; Episode.findByIdAndUpdate with tags array

**Edge case:** Episode created without scriptId populated — unlikely (scriptId required). If script empty, use title + description only.

---

### Feature 4: Topic Performance Heatmap

**Data flow:**
- AnalyticsSnapshot: `episodeId`, `platform`, `viewCount`, `likeCount`, `commentCount`, `shareCount`, `engagement`
- Episode: `tags` (ObjectId[] → Tag)
- Aggregate: join Episode with AnalyticsSnapshot; group by tag (or episode tag set); sum views, likes, comments; compute engagement rate
- API: GET `/api/analytics/heatmap` → `{ byTag: [{ tagId, tagName, totalViews, totalLikes, episodeCount, avgEngagement }] }`

**UI:**
- Analytics page: add "Topic Performance" section
- Heatmap: tag → engagement (color scale) or table: Tag | Avg Views | Avg Engagement | Episodes
- Use Recharts (already in package.json) or MUI Table

**Existing code to reuse:**
- `AnalyticsSnapshot` model, `Episode` model with `tags`
- `GET /api/analytics-snapshots`, `GET /api/episodes` with populate
- Analytics page layout

**Technical approach:**
- Aggregation pipeline: `AnalyticsSnapshot.aggregate([{ $lookup: Episode }, { $unwind: '$episode.tags' }, { $group: { tagId, sumViews, sumLikes, count } }])` — or simpler: fetch snapshots, fetch episodes with tags, aggregate in JS
- Simpler: fetch all snapshots with episodeId populated; fetch all episodes with tags; for each tag, sum metrics from episodes that have that tag
- Engagement: `(likes + comments + shares) / views` or use `engagement` field if set

**Edge case:** Episodes with no tags — exclude from tag-specific metrics; show "Untagged" bucket optional.

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
| Recharts | 2.10.x | Charts (heatmap) |

### New Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| (none) | — | All features use existing stack |

---

## Architecture Patterns

### AI Module Pattern (Existing)
- `src/lib/ai/*.ts`: `getOpenAIClient()`, `logAiUsage()`, return `{ success, data/error, tokensUsed, durationMs }`
- See `script-generator.ts`, `virality-scorer.ts`

### API Route Pattern (Existing)
- `connectToDatabase()`, `getServerSession()`, Zod validation
- `Response.json()` with status codes

### Script Full Text Extraction
```javascript
// From Script model
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const fullText = sections.filter(Boolean).join('\n\n');
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| JSON parsing from GPT | Manual regex | `JSON.parse` with try/catch; validate with Zod if needed |
| Template variable extraction | Custom parser | Regex `/\{\{(\w+)\}\}/g` |
| Heatmap visualization | Custom SVG | Recharts or MUI Table with simple color mapping |

---

## Common Pitfalls

### Repurposing
- **Script too long:** GPT context limit. Truncate script to first ~4000 tokens if needed; PRD says "first 500 words" for summary — use similar for very long scripts.
- **JSON parse failure:** GPT may return markdown-wrapped JSON. Strip ```json before parse.
- **Empty script:** Episode has scriptId but script empty. Return error or empty clips.

### Prompt Library
- **Variable injection:** User could inject `{{script}}` with malicious content. Sanitize not required for internal use; but do not allow arbitrary system prompts from user templates.
- **Run cost:** Each run consumes tokens. Log usage.

### Auto-Tagging
- **Tag creation race:** Two episodes could trigger creation of same tag concurrently. Use `findOneAndUpdate` with upsert or `findOne` + create if not exists.
- **Fire-and-forget:** Don't block episode creation. `autoTagEpisode(id).catch(console.error)`.

### Heatmap
- **Sparse data:** Few episodes with tags → heatmap may look empty. Show "Add tags to episodes for topic insights" when no tags.
- **Aggregation performance:** With 100s of snapshots, in-memory aggregation is fine. For 1000s, consider aggregation pipeline.

---

## Suggested Implementation Order

1. **Repurposing engine** — `repurposing-engine.ts`, POST `/api/episodes/[id]/repurpose`, Repurpose button on episode detail. Unblocks content creators immediately.
2. **Prompt library** — Prompt model, CRUD API, `/app/ai-toolkit` list + runner. Foundation for AI Toolkit.
3. **Auto-tagging** — `auto-tagger.ts`, hook into Episode POST. Improves Library filter UX.
4. **Topic heatmap** — `/api/analytics/heatmap`, Heatmap component on Analytics page. Builds on tags + snapshots.

---

## Deferred: Atlas Vector Search (Sprint 5)

**Required for semantic search:**
- Voyage AI client: `npm install voyageai`; `VoyageAIClient` from `voyageai`
- Model: `voyage-3-large` or `voyage-4-large`; `output_dimension: 1024`
- Add `embedding: number[]` to ContentIdea, Script, Episode schemas
- Create Atlas Vector Search index on each collection (or unified)
- Embedding pipeline: POST `/api/ideas/[id]/embed`, etc.; background job for batch
- Search: POST `/api/ai/search` — embed query, run `$vectorSearch` aggregation

**Why defer:** New infra, schema migration, index creation in Atlas UI, embedding pipeline. Sprint 4 focuses on features that reuse existing stack.

---

## Existing Code to Reuse

| Asset | Location | Use |
|-------|----------|-----|
| Episode detail page | `src/app/app/library/[id]/page.tsx` | Add Repurpose button |
| Episode API | `src/app/api/episodes/[id]/route.ts` | GET episode with scriptId |
| Script model | `src/lib/db/models/Script.ts` | hook, problem, solution, demo, cta, outro |
| OpenAI client | `src/lib/ai/openai-client.ts` | getOpenAIClient() |
| Usage logger | `src/lib/ai/usage-logger.ts` | logAiUsage |
| Tag model | `src/lib/db/models/Tag.ts` | Find/create tags |
| Tag CRUD | `src/app/api/tags/` | List tags for matching |
| Analytics page | `src/app/app/analytics/page.tsx` | Add heatmap section |
| Analytics API | `src/app/api/analytics-snapshots/route.ts` | Fetch snapshots |

---

## Dependencies & Edge Cases

### Repurposing
- **Dependency:** Episode with scriptId populated; Script with content
- **Edge case:** Script has no content (all sections empty) → return error or empty array

### Prompt Library
- **Dependency:** None
- **Edge case:** Prompt template with invalid variable names → validate on save

### Auto-Tagging
- **Dependency:** Tag model, Episode create flow
- **Edge case:** GPT returns tag names that don't match existing — create new tags with category `topic`

### Heatmap
- **Dependency:** AnalyticsSnapshot with episodeId; Episode with tags
- **Edge case:** No snapshots → return empty array; show "No data" in UI

---

## Phase Requirements (Sprint 4)

| ID | Description | Research Support |
|----|-------------|------------------|
| REPURPOSE-01 | Repurposing engine: YouTube script → 3–5 TikTok clip concepts | PRD Prompt 5; Script model; Episode API |
| REPURPOSE-02 | Repurpose UI on episode detail page | Library [id] page exists |
| PROMPT-01 | Prompt model with template, variables | New model; `{{var}}` regex |
| PROMPT-02 | Prompt CRUD API | Series/tags pattern |
| PROMPT-03 | Prompt runner: fill vars, execute, copy output | OpenAI client; logAiUsage |
| AUTO-TAG-01 | Auto-tag on episode create | Episode POST; GPT-4 classification |
| AUTO-TAG-02 | Match/create tags from classification | Tag model; slug generation |
| HEATMAP-01 | Topic performance heatmap API | AnalyticsSnapshot + Episode tags aggregation |
| HEATMAP-02 | Heatmap UI on Analytics page | Recharts; Analytics page layout |

---

## Sources

### Primary (HIGH confidence)
- Creator OS codebase: models, APIs, schemas, library pages
- PRD.md: Prompt 5 (Repurposing), Prompt 6 (SEO), AI Toolkit domains
- Voyage AI API: docs.voyageai.com/reference/embeddings-api
- MongoDB Atlas $vectorSearch: mongodb.com/docs/manual/reference/operator/aggregation/vectorSearch/

### Secondary (MEDIUM confidence)
- voyageai npm package: npmjs.com/package/voyageai
- Voyage voyage-3-large, voyage-4-large: 1024 dims supported

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing
- Architecture: HIGH — patterns established in Sprints 2–3
- Pitfalls: MEDIUM — edge cases identified from codebase review

**Research date:** 2026-03-18  
**Valid until:** ~30 days
