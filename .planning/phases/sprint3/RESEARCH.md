# Sprint 3: Content Library, Series UI, Tag Management, Script Version Diff — Research

**Researched:** 2026-03-18  
**Domain:** Next.js 14, Material-UI, MongoDB, content management, AI integration  
**Confidence:** HIGH

## Summary

Sprint 3 delivers four foundational features that build on existing models and APIs: **Content Library** (archive + browse published content), **Series management UI** (list, detail, create/edit), **Tag management system** (CRUD API + UI, tag selector in forms), and **Script version history + diff** (versions array exists; add diff view). All four reuse existing patterns—no new AI providers, no Vector Search infrastructure, no schema changes beyond optional Tag enhancements. Implementation order: Tag management first (unblocks tag selectors), then Series UI, Content Library, and Script version diff.

**Primary recommendation:** Implement Tag management → Series UI → Content Library → Script version diff. Defer Repurposing, Atlas Vector Search, Prompt library, Topic heatmap, and Auto-tagging to Sprint 4.

---

## Recommended Sprint 3 Scope

### In Scope (4 features)

| # | Feature | Effort | Rationale |
|---|---------|--------|------------|
| 1 | **Tag management system** | Medium | Tag model exists; no `/api/tags` CRUD. Ideas/scripts use `tags: ObjectId[]` but users cannot create tags. Unblocks tag selectors in idea/script forms. |
| 2 | **Series management UI** | Medium | Series model + GET/POST API exist. Need list page, detail page, create/edit. PRD specifies `/app/library/series` and `/app/library/series/[id]`. |
| 3 | **Content Library** | Medium | Episode API supports filters (publishingStatus, editingStatus). New `/app/library` page with episode list, filters (status, platform, series), and episode detail. Sidebar link. |
| 4 | **Script version history + diff** | Small | Script has `versions: IScriptVersion[]` with `{ version, content, createdAt }`. Content is JSON-serialized sections. Add diff view in Script Studio UI using `react-diff-viewer-continued`. |

### Deferred to Sprint 4

| Feature | Reason |
|---------|--------|
| Repurposing engine | Depends on Content Library; AI module + prompt. Higher complexity. |
| Atlas Vector Search + semantic search | Requires embedding pipeline (Voyage AI), schema changes, index creation. New infra. |
| Prompt library + runner | Separate domain (AI Toolkit); needs Prompt model + storage. |
| Topic performance heatmap | Requires `topicCluster` or tag aggregation on Episode; AnalyticsSnapshot model has no topic field. |
| Auto-tagging on ingest | Depends on episode creation flow; GPT-4 classification. |

---

## Architecture & Data Flow

### Feature 1: Tag Management System

**Data flow:**
- `Tag` model: `name`, `slug`, `description?`, `category` (topic|platform|audience|format)
- New: `/api/tags` GET (list), POST (create)
- New: `/api/tags/[id]` GET, PUT, DELETE
- Extend `CreateTagSchema` / `UpdateTagSchema` if needed (already in schemas.ts)

**UI:**
- `/app/tags` — list with filters by category, create button
- `/app/tags/new` — create form
- `/app/tags/[id]` — edit form
- Tag selector component: `TagSelector` — autocomplete/chip input for ideas and scripts
- Reuse: `CreateIdeaSchema` has `tags: z.array(z.string())` — pass tag IDs as strings

**Existing code to reuse:**
- `Tag` model at `src/lib/db/models/Tag.ts`
- `CreateTagSchema`, `UpdateTagSchema` in `src/lib/db/schemas.ts`
- Ideas API: `populate('tags')`; create accepts `tags: tagIds`
- Pattern: `src/app/api/series/route.ts` for CRUD structure

### Feature 2: Series Management UI

**Data flow:**
- `Series` model: `title`, `description?`, `episodeCount`, `status`
- Existing: `/api/series` GET, POST; `/api/series/[id]` GET, PUT, DELETE (soft-delete: sets status archived)
- Episodes: `seriesId` optional; filter episodes by `seriesId`

**UI:**
- `/app/series` — list (or `/app/library/series` per PRD)
- `/app/series/new` — create form
- `/app/series/[id]` — detail with episode list, edit
- Sidebar: add "Series" under Library or as sub-item

**Existing code to reuse:**
- `Series` model, `CreateSeriesSchema`, `UpdateSeriesSchema`
- `src/app/api/series/route.ts`, `src/app/api/series/[id]/route.ts`
- Episode API: add `seriesId` query param to GET
- Pattern: Analytics page for form + list layout

### Feature 3: Content Library

**Data flow:**
- `Episode` model: `ideaId`, `scriptId`, `seriesId?`, `title`, `description`, `publishingStatus`, `editingStatus`, `tags`, `publishingRecords`
- Existing: `/api/episodes` GET with `publishingStatus`, `editingStatus`, pagination
- Extend: add `seriesId` filter (Episode API currently lacks this; add to query), `tags` filter optional; add `.populate('tags')` for Library display
- Episode detail: GET `/api/episodes/[id]` with populate

**UI:**
- `/app/library` — episode list with filters (status, series, tag), cards or table
- `/app/library/[id]` — episode detail: title, description, script link, publishing records, analytics link
- Sidebar: add "Library" nav item

**Existing code to reuse:**
- Episode API, Episode model
- Pipeline page: episode cards, status chips
- CalendarView: episode metadata display

### Feature 4: Script Version History + Diff

**Data flow:**
- Script `versions`: `{ version, content, createdAt }` — `content` is JSON string of sections
- PUT `/api/scripts/[id]` already pushes new version on save
- No API changes; add GET versions in script response (already returned)

**UI:**
- Script Studio: "Version history" accordion or tab
- Version list: version number, date, optional change note (current model has no changeNote; can add later)
- Diff view: compare two versions — render `content` as readable text (sections concatenated) and diff
- Library: `react-diff-viewer-continued` — split or unified view

**Existing code to reuse:**
- `src/app/api/scripts/[id]/route.ts` — versions pushed on PUT
- Script model `versions` array
- Script detail page structure

**Technical approach:**
- Derive display text from version `content`: parse JSON, concatenate `hook`, `problem`, `solution`, `demo`, `cta`, `outro`
- Use `react-diff-viewer-continued` with `oldValue` and `newValue` as strings
- Install: `npm install react-diff-viewer-continued`

---

## Standard Stack

### Core (Existing)
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x | App Router, API routes |
| Material-UI | 5.15.x | UI components |
| MongoDB + Mongoose | 8.3.x | Data persistence |
| OpenAI | 4.52.x | GPT-4 (not used in Sprint 3) |
| Zod | 3.23.x | Validation |

### New Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| react-diff-viewer-continued | ^4.x | Script version diff UI |

```bash
npm install react-diff-viewer-continued
```

---

## Architecture Patterns

### API Route Structure (Existing)
- `connectToDatabase()`, `getServerSession()`, Zod validation
- `Response.json()` with status codes
- See `src/app/api/series/route.ts`, `src/app/api/analytics-snapshots/route.ts`

### Component Patterns (Existing)
- MUI `Box`, `Paper`, `Stack`, `TextField`, `Button`, `Table`
- `useEffect` + `fetch` for data loading
- `Snackbar` for success/error feedback
- See `src/app/app/analytics/page.tsx`, `src/app/app/pipeline/page.tsx`

### Tag Selector Pattern
- MUI `Autocomplete` with `multiple` + `freeSolo: false`
- Options from GET `/api/tags`
- Value: array of tag IDs (ObjectId as string)
- Display: tag `name`; group by `category` optional

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|--------------|
| Text diff | Custom diff algorithm | react-diff-viewer-continued |
| Tag autocomplete | Custom dropdown | MUI Autocomplete |
| Episode list filters | Custom filter UI | MUI Select/MenuItem + query params |

---

## Common Pitfalls

### Tag Management
- **Slug uniqueness:** Tag model has `unique: true` on `name` and `slug`. Generate slug from name (e.g. `name.toLowerCase().replace(/\s+/g, '-')`) or require both.
- **Orphaned refs:** Deleting a tag used by ideas/episodes — either soft-delete or prevent delete if `usageCount > 0`. Current Tag model has no `usageCount`; consider adding or check references before delete.

### Series Management
- **episodeCount denormalization:** PRD Series has `episodeCount`. Update on episode create/update/delete when `seriesId` changes. Current implementation may not maintain this; add in Series UI or defer.

### Content Library
- **Filter combinations:** Support multiple filters (status + series + tag). Build query object from search params; use `$in` for array filters.

### Script Version Diff
- **Large content:** Versions store full JSON. For very long scripts, consider virtualizing or truncating diff view. Start simple.
- **Content format:** Current `content` is JSON. For human-readable diff, stringify sections in consistent order: hook, problem, solution, demo, cta, outro.

---

## Suggested Implementation Order

1. **Tag management** — API + list + create/edit pages + TagSelector component. Unblocks tag usage in ideas.
2. **Series management UI** — List + detail + create/edit. Episode API already supports seriesId via Episode model.
3. **Content Library** — Library page + episode list + filters + detail page. Add sidebar link.
4. **Script version diff** — Version history UI + diff component in Script Studio.

---

## Existing Code to Reuse

| Asset | Location | Use |
|-------|----------|-----|
| Tag model | `src/lib/db/models/Tag.ts` | Tag CRUD |
| CreateTagSchema, UpdateTagSchema | `src/lib/db/schemas.ts` | Validation |
| Series API | `src/app/api/series/`, `src/app/api/series/[id]/` | Series CRUD |
| Episode API | `src/app/api/episodes/`, `src/app/api/episodes/[id]/` | Library data |
| Script versions | `src/lib/db/models/Script.ts`, `src/app/api/scripts/[id]/route.ts` | Version diff |
| Analytics page layout | `src/app/app/analytics/page.tsx` | Form + list pattern |
| Pipeline page | `src/app/app/pipeline/page.tsx` | Episode cards, status chips |
| AppSidebar | `src/components/shared-ui/AppSidebar.tsx` | Add Library, Series, Tags |

---

## Dependencies & Edge Cases

### Tag Management
- **Dependency:** None
- **Edge case:** Tag slug must be unique. On create, auto-generate from name if not provided.
- **Edge case:** Ideas/scripts reference tags by ObjectId. TagSelector must return IDs.

### Series Management
- **Dependency:** Episode API (existing)
- **Edge case:** `episodeCount` on Series — either add maintenance logic or compute on read.

### Content Library
- **Dependency:** Episode API, PublishingRecord (populated)
- **Edge case:** Pagination — Episode API has `page`, `limit`. Default limit 20.

### Script Version Diff
- **Dependency:** `react-diff-viewer-continued`
- **Edge case:** First version — nothing to diff. Show single version or "No previous version".

---

## Sprint 4 Preview (Deferred)

| Feature | Prerequisites | Notes |
|--------|---------------|-------|
| Repurposing engine | Content Library (episode detail page) | PRD Prompt 5; GPT-4; new `repurposing-engine.ts` |
| Atlas Vector Search | Voyage AI client, `embedding` field on ContentIdea/Episode/Script, index creation | voyage-3-large or voyage-4-large, 1024 dims |
| Prompt library | Prompt model (name, template, variables) | `{{variable}}` syntax; run panel |
| Topic heatmap | topicCluster on Episode or tag aggregation | AnalyticsSnapshot has no topic; derive from tags or add field |
| Auto-tagging | Episode create/update flow | GPT-4 classification → tag IDs |

---

## Sources

### Primary (HIGH confidence)
- Creator OS codebase: models, APIs, schemas
- PRD.md: feature specs, prompt library, data model
- MongoDB Atlas Vector Search docs: $vectorSearch stage
- react-diff-viewer-continued: npm, 457K weekly downloads

### Secondary (MEDIUM confidence)
- Voyage AI: voyage-3-large, voyage-4-large 1024 dims; voyageai npm package
- MUI Autocomplete for tag selector

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing or well-documented
- Architecture: HIGH — patterns established in Sprint 2
- Pitfalls: MEDIUM — edge cases identified from codebase review

**Research date:** 2026-03-18  
**Valid until:** ~30 days
