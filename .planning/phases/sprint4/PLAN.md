# Sprint 4: Repurposing, Prompt Library, Auto-Tagging, Heatmap

**Phase:** sprint4  
**Source:** `.planning/phases/sprint4/RESEARCH.md`  
**Implementation order:** 1 → 2 → 3 → 4

**GSD plan files (for execute-phase):**
- `sprint4-01-PLAN.md` — Repurposing engine
- `sprint4-02-PLAN.md` — Prompt library + runner
- `sprint4-03-PLAN.md` — Auto-tagging on ingest
- `sprint4-04-PLAN.md` — Topic performance heatmap

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | Repurposing engine | Plan 01 | repurposing-engine.ts, /api/episodes/[id]/repurpose, library/[id]/page |
| 2 | Prompt library + runner | Plan 02 | Prompt model, /api/prompts, /app/ai-toolkit |
| 3 | Auto-tagging on ingest | Plan 03 | auto-tagger.ts, Episode POST hook |
| 4 | Topic performance heatmap | Plan 04 | /api/analytics/heatmap, analytics page |

---

## Plan 01: Repurposing Engine

**Requirements:** REPURPOSE-01, REPURPOSE-02  
**Wave:** 1  
**Depends on:** —

### Task 01-1: Repurposing engine module

**Files:** `src/lib/ai/repurposing-engine.ts`

**Action:**
- Create `generateClipConcepts(script: string, title: string, platform?: string)`.
- Use `getOpenAIClient()` from `@/lib/ai/openai-client`.
- System prompt per RESEARCH.md PRD Prompt 5:
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
- Use `response_format: { type: 'json_object' }`.
- Strip markdown code fences (```json) before `JSON.parse` if present.
- Return `{ success: true, clips: Clip[] }` or `{ success: false, error: string }`.
- Call `logAiUsage({ category: 'repurposing', ... })` (fire-and-forget).
- Truncate script to ~4000 chars if very long to avoid context limits.

**Verify:** `npm run build` passes; file exists and exports `generateClipConcepts`.

**Done:** Function returns structured clips from sample script input.

---

### Task 01-2: Repurpose API route

**Files:** `src/app/api/episodes/[id]/repurpose/route.ts`

**Action:**
- Create POST handler.
- Auth: `getServerSession()`, return 401 if unauthenticated.
- Validate `params.id` with `Types.ObjectId.isValid`.
- Fetch episode: `Episode.findById(id).populate('scriptId')`.
- If no episode or no scriptId: return 404 or 400.
- Build script text: `[script.hook, script.problem, script.solution, script.demo, script.cta, script.outro].filter(Boolean).join('\n\n')`.
- If empty script: return 400.
- Parse body: `{ platform?: string }` (default `'tiktok'`).
- Call `generateClipConcepts(scriptText, episode.title, platform)`.
- Return `{ clips }` on success, `{ error }` on failure with 500.

**Verify:** `curl -X POST http://localhost:3000/api/episodes/{validId}/repurpose -H "Cookie: ..."` returns 200 with clips (or 404/400 for invalid).

**Done:** API returns clip concepts for episode with script.

---

### Task 01-3: Repurpose button on episode detail

**Files:** `src/app/app/library/[id]/page.tsx`

**Action:**
- Add "Repurpose" Button (e.g. `AutoAwesomeIcon`) in the Stack with View Script, Analytics.
- On click: open MUI Dialog.
- Dialog: call `POST /api/episodes/${id}/repurpose` with optional platform select (tiktok default).
- Show loading state during request.
- Display clips in list/cards: conceptTitle, newHook, script (expandable), Copy button per clip.
- Handle error state in dialog.
- Episode interface: ensure scriptId can be populated object with script sections for display (API returns episode with scriptId populated).

**Verify:** Visit `/app/library/{episodeId}`, click Repurpose, see clips or error. Copy works.

**Done:** User can repurpose episode and copy clip content.

---

## Plan 02: Prompt Library + Runner

**Requirements:** PROMPT-01, PROMPT-02, PROMPT-03  
**Wave:** 2  
**Depends on:** —

### Task 02-1: Prompt model and schema

**Files:** `src/lib/db/models/Prompt.ts`, `src/lib/db/schemas.ts`

**Action:**
- Create Prompt model: `name` (string, required), `template` (string, required), `variables` (string[], derived on save), `category` (string, optional).
- On save: extract variables with `template.match(/\{\{(\w+)\}\}/g)` → unique var names → store in `variables`.
- Add `CreatePromptSchema`, `UpdatePromptSchema` in schemas.ts.
- Add `prompt-run` to `logAiUsage` category and `AiUsageLog` model enum (or use `'other'` for prompt runs per RESEARCH).

**Verify:** `npm run build` passes. Model and schemas exist.

**Done:** Prompt model persists prompts with template and extracted variables.

---

### Task 02-2: Prompt CRUD API

**Files:** `src/app/api/prompts/route.ts`, `src/app/api/prompts/[id]/route.ts`

**Action:**
- **GET /api/prompts:** List prompts, `connectToDatabase`, `getServerSession`, return `{ data: prompts }`.
- **POST /api/prompts:** Create prompt, validate with `CreatePromptSchema`, extract variables on create.
- **GET /api/prompts/[id]:** Single prompt by id.
- **PUT /api/prompts/[id]:** Update with `UpdatePromptSchema`, re-extract variables if template changed.
- **DELETE /api/prompts/[id]:** Delete prompt.
- Follow patterns from `src/app/api/series/route.ts` and `src/app/api/tags/[id]/route.ts`.

**Verify:** `curl` GET/POST/PUT/DELETE on /api/prompts returns expected status and body.

**Done:** Full CRUD for prompts.

---

### Task 02-3: Prompt run API

**Files:** `src/app/api/prompts/[id]/run/route.ts`

**Action:**
- POST handler.
- Body: `{ variables: Record<string, string> }`.
- Load prompt by id.
- Fill template: `template.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? '')`.
- Call OpenAI `client.chat.completions.create` with filled template as user message, no system prompt from user (use safe default: "You are a helpful assistant.").
- `logAiUsage` with category `'other'` (or `'prompt-run'` if added).
- Return `{ output: string }` or `{ error: string }`.

**Verify:** Create prompt with `{{title}}` and `{{script}}`, POST run with variables, get completion.

**Done:** Prompt run returns AI output.

---

### Task 02-4: AI Toolkit list page

**Files:** `src/app/app/ai-toolkit/page.tsx`, `src/components/shared-ui/AppSidebar.tsx`

**Action:**
- Add nav item: `{ label: 'AI Toolkit', href: '/app/ai-toolkit', icon: <PsychologyIcon /> }` (or similar).
- Create `/app/ai-toolkit/page.tsx`: fetch `/api/prompts`, list prompts in table/cards with name, category, actions (Edit, Delete, Run).
- Link "Run" to `/app/ai-toolkit/[id]` (runner page).
- "New Prompt" button → form or dialog to create prompt (name, template, category).

**Verify:** Visit /app/ai-toolkit, see prompts, create new, navigate to runner.

**Done:** AI Toolkit list with create and run links.

---

### Task 02-5: Prompt runner page

**Files:** `src/app/app/ai-toolkit/[id]/page.tsx`

**Action:**
- Fetch prompt by id from `/api/prompts/${id}`.
- Render form: one TextField per variable (from prompt.variables).
- "Execute" button: POST `/api/prompts/${id}/run` with `{ variables }`.
- Display output in Box/Paper with "Copy to clipboard" button.
- Handle loading and error states.

**Verify:** Open runner for prompt with `{{title}}`, enter value, Execute, copy output.

**Done:** User can run prompt and copy output.

---

## Plan 03: Auto-Tagging on Ingest

**Requirements:** AUTO-TAG-01, AUTO-TAG-02  
**Wave:** 3  
**Depends on:** —

### Task 03-1: Auto-tagger module

**Files:** `src/lib/ai/auto-tagger.ts`

**Action:**
- Create `autoTagEpisode(episodeId: string): Promise<void>`.
- Fetch episode with `Episode.findById(episodeId).populate('scriptId')`.
- Build text: script sections `[hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')`; prepend title; use first ~500 chars if very long.
- GPT-4 prompt: "Classify this content. Return JSON array of tag names (topics, technologies, audience). Example: [\"mongodb\", \"rag\", \"beginner\"]."
- `response_format: { type: 'json_object' }` — request `{ "tags": ["name1", "name2"] }` for consistent parse.
- Parse response, extract tag names.
- For each name: find Tag by `slug` (name.toLowerCase().replace(/\s+/g, '-')) or by `name`; if not found, create Tag with `category: 'topic'`, `slug` from name.
- `Episode.findByIdAndUpdate(episodeId, { $set: { tags: tagIds } })`.
- `logAiUsage({ category: 'tagging', ... })`.
- Use `findOneAndUpdate` with upsert for tag creation to avoid race conditions.

**Verify:** `npm run build` passes. Module exports `autoTagEpisode`.

**Done:** Function assigns tags to episode from classification.

---

### Task 03-2: Hook into Episode POST

**Files:** `src/app/api/episodes/route.ts`

**Action:**
- After `Episode.create(...)` and before `return Response.json(episode, { status: 201 })`:
- Add `autoTagEpisode(episode._id.toString()).catch(console.error)` (fire-and-forget).
- Do NOT await — episode creation must not block on tagging.

**Verify:** Create episode via API, check episode has tags after a few seconds (or inspect DB).

**Done:** New episodes get auto-tagged asynchronously.

---

## Plan 04: Topic Performance Heatmap

**Requirements:** HEATMAP-01, HEATMAP-02  
**Wave:** 4  
**Depends on:** —

### Task 04-1: Heatmap API

**Files:** `src/app/api/analytics/heatmap/route.ts`

**Action:**
- GET handler.
- Auth: `getServerSession`, return 401 if unauthenticated.
- Fetch: `AnalyticsSnapshot.find().populate('episodeId')`; then fetch episodes with `tags` populated, or use aggregation.
- Simpler approach: fetch all snapshots with episodeId populated; fetch all episodes with tags populated; in JS: for each tag, sum viewCount, likeCount, commentCount, shareCount from snapshots whose episode has that tag.
- Compute engagement: `(likes + comments + shares) / views` or use snapshot.engagement if set.
- Return `{ byTag: [{ tagId, tagName, totalViews, totalLikes, episodeCount, avgEngagement }] }`.
- Handle empty data: return `{ byTag: [] }`.

**Verify:** `curl GET /api/analytics/heatmap` returns 200 with byTag array.

**Done:** API returns tag-level performance metrics.

---

### Task 04-2: Heatmap section on Analytics page

**Files:** `src/app/app/analytics/page.tsx`

**Action:**
- Add "Topic Performance" section above or below Snapshots.
- Fetch `/api/analytics/heatmap` on load (with other data or separately).
- Display: MUI Table with columns Tag | Total Views | Total Likes | Episodes | Avg Engagement.
- Or use Recharts (e.g. BarChart) with tag on x-axis, engagement/views on y-axis.
- Empty state: "Add tags to episodes for topic insights" when byTag is empty.

**Verify:** Visit /app/analytics, see Topic Performance section with data or empty state.

**Done:** User sees topic performance on Analytics page.

---

## Implementation Order (Incremental Commits)

1. **Plan 01** — Repurposing (3 commits)
   - Commit 1: `feat(sprint4): add repurposing-engine.ts`
   - Commit 2: `feat(sprint4): add POST /api/episodes/[id]/repurpose`
   - Commit 3: `feat(sprint4): add Repurpose button and dialog on episode detail`

2. **Plan 02** — Prompt Library (5 commits)
   - Commit 1: `feat(sprint4): add Prompt model and schemas`
   - Commit 2: `feat(sprint4): add Prompt CRUD API`
   - Commit 3: `feat(sprint4): add POST /api/prompts/[id]/run`
   - Commit 4: `feat(sprint4): add AI Toolkit list page and nav`
   - Commit 5: `feat(sprint4): add Prompt runner page`

3. **Plan 03** — Auto-tagging (2 commits)
   - Commit 1: `feat(sprint4): add auto-tagger.ts`
   - Commit 2: `feat(sprint4): hook auto-tag into Episode POST`

4. **Plan 04** — Heatmap (2 commits)
   - Commit 1: `feat(sprint4): add GET /api/analytics/heatmap`
   - Commit 2: `feat(sprint4): add Topic Performance section on Analytics page`

---

## Key Interfaces (for executor reference)

### Script full text extraction
```javascript
const sections = [script.hook, script.problem, script.solution, script.demo, script.cta, script.outro];
const fullText = sections.filter(Boolean).join('\n\n');
```

### Template variable fill
```javascript
template.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? '');
```

### Tag slug from name
```javascript
name.toLowerCase().replace(/\s+/g, '-');
```

### Existing patterns
- `connectToDatabase()` before DB ops
- `getServerSession()` for auth
- `getOpenAIClient()` for OpenAI
- `logAiUsage({ category, tokensUsed, durationMs, success })` fire-and-forget

---

## Verification Summary

| Plan | Automated | Manual |
|------|-----------|--------|
| 01 | `npm run build` | Repurpose flow on episode detail |
| 02 | `npm run build`, API curl | AI Toolkit list + runner flow |
| 03 | `npm run build` | Create episode, verify tags |
| 04 | `npm run build`, API curl | Analytics heatmap section |
