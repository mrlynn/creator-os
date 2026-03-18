---
phase: sprint3
plan: 03
type: execute
wave: 3
depends_on: [sprint3-02]
files_modified:
  - src/app/api/episodes/route.ts
  - src/app/app/library/page.tsx
  - src/app/app/library/[id]/page.tsx
  - src/components/shared-ui/AppSidebar.tsx
autonomous: true
requirements: [S3-LIBRARY-01, S3-LIBRARY-02]

must_haves:
  truths:
    - "User can browse episodes in Library with filters"
    - "User can view episode detail (title, description, script link, publishing records)"
  artifacts:
    - path: src/app/app/library/page.tsx
      provides: "Episode list with filters"
      min_lines: 80
    - path: src/app/app/library/[id]/page.tsx
      provides: "Episode detail view"
      min_lines: 60
  key_links:
    - from: src/app/app/library/page.tsx
      to: "/api/episodes"
      via: "fetch with query params"
    - from: src/app/app/library/[id]/page.tsx
      to: "/api/episodes/[id]"
      via: "fetch by id"
---

<objective>
Deliver Content Library: /app/library with episode list, filters (status, series, tag), and /app/library/[id] episode detail. Add sidebar link.

Purpose: Archive + browse published content. Episode API exists; add seriesId (Plan 02), tags filter, and .populate('tags') for display.
Output: /app/library, /app/library/[id], sidebar Library link.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint3/RESEARCH.md
@CLAUDE.md
@src/app/api/episodes/route.ts
@src/app/api/episodes/[id]/route.ts
@src/app/app/pipeline/page.tsx
</context>

<interfaces>
From src/app/api/episodes/route.ts:
- GET: ?publishingStatus, ?editingStatus, ?seriesId (Plan 02), ?page, ?limit
- Returns: { data: episodes, pagination: { page, limit, total, pages } }
- Episodes: populate ideaId, scriptId, publishingRecords. Add .populate('tags') for Library.

From src/app/api/episodes/[id]/route.ts:
- GET: returns episode with populate ideaId, scriptId, publishingRecords
- Add .populate('tags') for consistency.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Extend Episode API with tags filter and populate tags</name>
  <files>src/app/api/episodes/route.ts, src/app/api/episodes/[id]/route.ts</files>
  <action>
1. In src/app/api/episodes/route.ts GET handler:
   - Parse searchParams: tags = searchParams.get('tags'). If present, split by comma (tags can be multiple IDs). Validate each with Types.ObjectId.isValid. If valid, add query.tags = { $in: tagIds } (or $all for "must have all" - use $in for "any of these tags").
   - Add .populate('tags') to the Episode.find() chain (after populate ideaId, scriptId, publishingRecords).

2. In src/app/api/episodes/[id]/route.ts GET handler:
   - Add .populate('tags') to the findById chain.
</action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Episode API supports tags filter; episode responses include populated tags.</done>
</task>

<task type="auto">
  <name>Task 2: Library page with episode list and filters</name>
  <files>src/app/app/library/page.tsx</files>
  <action>
Create src/app/app/library/page.tsx:
- Client component. State: episodes, loading, filters (publishingStatus, editingStatus, seriesId, tagIds).
- Fetch GET /api/episodes with query params: publishingStatus, editingStatus, seriesId, tags (comma-separated IDs). Also fetch GET /api/series for series filter dropdown, GET /api/tags for tag filter.
- Filters: MUI Select for publishingStatus (draft, scheduled, published, archived, all), Select for editingStatus (not-started, recording, editing, done, all), Select for series (options from /api/series), Autocomplete or multi-select for tags (options from /api/tags).
- Display: Grid of episode cards (similar to Pipeline) or Table. Each card: title, description (truncated), publishingStatus chip, editingStatus chip, tags chips, series name if any. Click navigates to /app/library/[id].
- Pagination: use pagination from API response (page, pages). Show page controls.
- Empty state if no episodes.

Follow patterns from src/app/app/pipeline/page.tsx (episode cards, status chips) and src/app/app/ideas/page.tsx (filters).
</action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Library page loads; filters work; episode cards link to detail.</done>
</task>

<task type="auto">
  <name>Task 3: Episode detail page + sidebar</name>
  <files>src/app/app/library/[id]/page.tsx, src/components/shared-ui/AppSidebar.tsx</files>
  <action>
1. Create src/app/app/library/[id]/page.tsx:
   - Client component. useParams for id. Fetch GET /api/episodes/[id] on mount.
   - Display: title, description, publishingStatus, editingStatus, series (link to /app/series/[id] if present), tags (chips), link to script (link to /app/scripts/[scriptId] if scriptId present), publishing records (platform, status, publishedUrl, scheduledDate).
   - Link to analytics if applicable (e.g. /app/analytics).

2. Update AppSidebar.tsx:
   - Add nav item: { label: 'Library', href: '/app/library', icon: <VideoLibraryIcon fontSize="small" /> }. Import VideoLibraryIcon from @mui/icons-material/VideoLibrary (or FolderIcon if preferred).
</action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Episode detail loads; sidebar has Library link.</done>
</task>

</tasks>

<verification>
- GET /api/episodes?tags=id1,id2 returns filtered episodes
- /app/library: list with filters loads
- /app/library/[id]: detail loads, links work
</verification>

<success_criteria>
- Episode API supports tags filter and populate tags
- Library page with filters functional
- Episode detail page functional
- Sidebar links to Library
</success_criteria>

<output>
After completion, create .planning/phases/sprint3/sprint3-03-SUMMARY.md
</output>
