---
phase: sprint3
plan: 02
type: execute
wave: 2
depends_on: [sprint3-01]
files_modified:
  - src/app/api/episodes/route.ts
  - src/app/app/series/page.tsx
  - src/app/app/series/new/page.tsx
  - src/app/app/series/[id]/page.tsx
  - src/components/shared-ui/AppSidebar.tsx
autonomous: true
requirements: [S3-SERIES-01, S3-SERIES-02, S3-SERIES-03]

must_haves:
  truths:
    - "User can list series with status filter"
    - "User can create new series"
    - "User can view series detail with episode list"
    - "User can edit and archive series"
  artifacts:
    - path: src/app/app/series/page.tsx
      provides: "Series list with create button"
      min_lines: 50
    - path: src/app/app/series/[id]/page.tsx
      provides: "Series detail with episodes"
      min_lines: 80
  key_links:
    - from: src/app/app/series/[id]/page.tsx
      to: "/api/episodes"
      via: "fetch with seriesId query param"
---

<objective>
Deliver Series management UI: list page, create form, detail page with episode list, edit/archive. Extend Episode API with seriesId filter for series detail.

Purpose: Series model + API exist; users need UI to manage series and see episodes per series.
Output: /app/series, /app/series/new, /app/series/[id], sidebar link, Episode API seriesId filter.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint3/RESEARCH.md
@CLAUDE.md
@src/app/api/series/route.ts
@src/app/api/series/[id]/route.ts
@src/app/api/episodes/route.ts
@src/app/app/analytics/page.tsx
</context>

<interfaces>
From src/app/api/series/route.ts:
- GET: ?status=active|all, returns { data: seriesList }
- POST: CreateSeriesSchema (title, description?)

From src/app/api/series/[id]/route.ts:
- GET: returns series
- PUT: UpdateSeriesSchema (title?, description?, status?)
- DELETE: soft-delete (sets status archived)

From src/app/api/episodes/route.ts:
- GET: ?publishingStatus, ?editingStatus, ?page, ?limit
- Need to add: ?seriesId
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Extend Episode API with seriesId filter</name>
  <files>src/app/api/episodes/route.ts</files>
  <action>
In GET handler of src/app/api/episodes/route.ts:
- Parse searchParams: seriesId = searchParams.get('seriesId')
- If seriesId present and Types.ObjectId.isValid(seriesId), add query.seriesId = new Types.ObjectId(seriesId)
- No other changes to response format

Reference: existing publishingStatus, editingStatus pattern in same file.
  </action>
  <verify>
    <automated>curl -s "http://localhost:3000/api/episodes?seriesId=000000000000000000000000" 2>/dev/null | head -1 || echo "Start dev server first"</automated>
  </verify>
  <done>GET /api/episodes?seriesId=xxx returns episodes filtered by series.</done>
</task>

<task type="auto">
  <name>Task 2: Series list and create pages</name>
  <files>src/app/app/series/page.tsx, src/app/app/series/new/page.tsx</files>
  <action>
1. Create src/app/app/series/page.tsx:
   - Client component. fetch('/api/series') on mount. Optional status filter (all, active, completed, archived) via Select or query param. Display series in MUI Table or Paper cards. Columns: title, description (truncated), status, episodeCount, createdAt. Row click or "View" links to /app/series/[id]. "Add Series" button to /app/series/new. Snackbar for errors.

2. Create src/app/app/series/new/page.tsx:
   - Client component. Form: TextField (title), TextField (description, multiline, optional). Submit POST /api/series. On success, redirect to /app/series. Use Snackbar for errors. Back button to /app/series.

Follow patterns from src/app/app/ideas/page.tsx and src/app/app/analytics/page.tsx.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Series list loads; create form works.</done>
</task>

<task type="auto">
  <name>Task 3: Series detail page with episode list + edit + sidebar</name>
  <files>src/app/app/series/[id]/page.tsx, src/components/shared-ui/AppSidebar.tsx</files>
  <action>
1. Create src/app/app/series/[id]/page.tsx:
   - Client component. useParams for id. Fetch GET /api/series/[id] for series. Fetch GET /api/episodes?seriesId={id} for episodes. Display: series title, description, status, episodeCount. Edit form (inline or dialog): title, description, status. Submit PUT /api/series/[id]. Delete/Archive button: DELETE /api/series/[id] (soft-delete), redirect to /app/series. Episode list: cards or table with episode title, link to /app/library/[episodeId] (or /app/pipeline for now if library not built). Empty state if no episodes. Back button to /app/series.

2. Update AppSidebar.tsx:
   - Add nav item: { label: 'Series', href: '/app/series', icon: <CollectionsBookmarkIcon fontSize="small" /> }. Import CollectionsBookmarkIcon from @mui/icons-material/CollectionsBookmark.

For episode link: use /app/library/[id] when Content Library exists (Plan 03). Until then, link to /app/pipeline or just show title.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Series detail loads; episode list shows; edit works; archive works; sidebar has Series.</done>
</task>

</tasks>

<verification>
- GET /api/episodes?seriesId=xxx returns filtered episodes
- /app/series: list loads
- /app/series/new: create works
- /app/series/[id]: detail loads, episodes listed, edit/archive work
</verification>

<success_criteria>
- Episode API supports seriesId filter
- Series list, create, detail pages functional
- Sidebar links to Series
</success_criteria>

<output>
After completion, create .planning/phases/sprint3/sprint3-02-SUMMARY.md
</output>
