---
phase: sprint3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/api/tags/route.ts
  - src/app/api/tags/[id]/route.ts
  - src/app/app/tags/page.tsx
  - src/app/app/tags/new/page.tsx
  - src/app/app/tags/[id]/page.tsx
  - src/components/tags/TagSelector.tsx
  - src/components/ideas/IdeaCaptureForm.tsx
  - src/components/shared-ui/AppSidebar.tsx
  - src/lib/db/schemas.ts
autonomous: true
requirements: [S3-TAG-01, S3-TAG-02, S3-TAG-03]

must_haves:
  truths:
    - "User can list tags with filters by category"
    - "User can create new tags"
    - "User can edit and delete tags"
    - "User can select tags when creating ideas via TagSelector"
  artifacts:
    - path: src/app/api/tags/route.ts
      provides: "Tag list (GET) and create (POST)"
      exports: ["GET", "POST"]
    - path: src/app/api/tags/[id]/route.ts
      provides: "Tag get (GET), update (PUT), delete (DELETE)"
      exports: ["GET", "PUT", "DELETE"]
    - path: src/components/tags/TagSelector.tsx
      provides: "Autocomplete tag picker for forms"
      min_lines: 40
  key_links:
    - from: src/app/app/tags/page.tsx
      to: "/api/tags"
      via: "fetch on mount"
    - from: src/components/ideas/IdeaCaptureForm.tsx
      to: "/api/tags"
      via: "TagSelector fetches options"
---

<objective>
Deliver Tag management system: CRUD API, list/create/edit pages, TagSelector component, and wire TagSelector into idea form (IdeaCaptureForm).

Purpose: Unblocks tag usage in ideas; users cannot create tags today. Tag model exists.
Output: /api/tags, /api/tags/[id], /app/tags, /app/tags/new, /app/tags/[id], TagSelector, sidebar link.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint3/RESEARCH.md
@CLAUDE.md
@src/lib/db/models/Tag.ts
@src/lib/db/schemas.ts
@src/app/api/series/route.ts
@src/app/app/analytics/page.tsx
</context>

<interfaces>
From src/lib/db/schemas.ts:
CreateTagSchema: name, slug, description?, category (topic|platform|audience|format)
UpdateTagSchema: partial of CreateTagSchema

From src/lib/db/models/Tag.ts:
ITag: name, slug, description?, category, createdAt, updatedAt

From src/app/api/series/route.ts pattern:
- connectToDatabase(), getServerSession(), Zod validation
- Response.json() with status codes
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Tag API (GET list, POST create, GET/PUT/DELETE [id])</name>
  <files>src/app/api/tags/route.ts, src/app/api/tags/[id]/route.ts, src/lib/db/schemas.ts</files>
  <action>
1. Schema: Make slug optional in CreateTagSchema (slug: z.string().optional()). In POST handler, if slug not provided, generate from name: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''). If slug provided, use as-is.

2. Create src/app/api/tags/route.ts:
   - GET: connectToDatabase(), getServerSession(), return 401 if no session. Parse searchParams: category (optional). Build query: if category, add { category }. Find tags, sort by name. Return { data: tags }.
   - POST: connectToDatabase(), getServerSession(), return 401 if no session. Parse body, CreateTagSchema.safeParse(body). If invalid, return 400 with details. If slug missing, generate from name. Create tag with Tag.create({ ...data, slug: slug || generated }). Return 201 with created tag.

3. Create src/app/api/tags/[id]/route.ts:
   - GET: connectToDatabase(), getServerSession(), validate params.id with Types.ObjectId.isValid. FindById. Return 404 if not found. Return tag.
   - PUT: connectToDatabase(), getServerSession(), validate params.id. UpdateTagSchema.safeParse(body). If invalid, return 400. findByIdAndUpdate with $set. Return 404 if not found. Return updated tag.
   - DELETE: connectToDatabase(), getServerSession(), validate params.id. findByIdAndDelete. Return 404 if not found. Return { message: 'Tag deleted' }.

Use Tag model from @/lib/db/models/Tag. Follow existing patterns from src/app/api/series/route.ts.
  </action>
  <verify>
    <automated>curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/tags 2>/dev/null || echo "Start dev server first: npm run dev"</automated>
  </verify>
  <done>GET /api/tags returns 200 with data array; POST /api/tags with valid body returns 201; GET/PUT/DELETE /api/tags/[id] work.</done>
</task>

<task type="auto">
  <name>Task 2: Tag list, create, edit pages</name>
  <files>src/app/app/tags/page.tsx, src/app/app/tags/new/page.tsx, src/app/app/tags/[id]/page.tsx</files>
  <action>
1. Create src/app/app/tags/page.tsx:
   - Client component. fetch('/api/tags') on mount. Optional: category filter via query param (e.g. ?category=topic). Display tags in MUI Table or list (Paper, Stack). Columns: name, category, slug, actions (Edit, Delete). Edit links to /app/tags/[id]. Delete calls DELETE /api/tags/[id], refetch. Add "Add Tag" button linking to /app/tags/new. Snackbar for success/error.

2. Create src/app/app/tags/new/page.tsx:
   - Client component. Form: TextField (name, slug optional), TextField (description optional), Select (category: topic, platform, audience, format). Submit POST /api/tags. On success, redirect to /app/tags. Use Snackbar for errors.

3. Create src/app/app/tags/[id]/page.tsx:
   - Client component. useParams for id. Fetch GET /api/tags/[id] on mount. Form: name, slug, description, category. Submit PUT /api/tags/[id]. Delete button calls DELETE /api/tags/[id], then redirect to /app/tags. Back button to /app/tags.

Follow patterns from src/app/app/analytics/page.tsx (form + list) and src/app/app/ideas/page.tsx
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Tags list page loads; create form works; edit form works; delete works.</done>
</task>

<task type="auto">
  <name>Task 3: TagSelector component + wire into IdeaCaptureForm + sidebar</name>
  <files>src/components/tags/TagSelector.tsx, src/components/ideas/IdeaCaptureForm.tsx, src/components/shared-ui/AppSidebar.tsx</files>
  <action>
1. Create src/components/tags/TagSelector.tsx:
   - Props: value: string[], onChange: (ids: string[]) => void, label?: string (default "Tags")
   - fetch('/api/tags') for options. MUI Autocomplete with multiple, freeSolo: false. Options: { id: tag._id, label: tag.name, category: tag.category }. Value: array of tag IDs (ObjectId as string). Group by category optional (ListSubheader). Display selected as Chips. onChange maps selected options to ids.

2. Update IdeaCaptureForm.tsx:
   - Add tags: [] to formData. Add TagSelector: value={formData.tags || []} onChange={(ids) => setFormData(p => ({ ...p, tags: ids }))}. Include tags in JSON body on submit.

3. Update AppSidebar.tsx:
   - Add nav item: { label: 'Tags', href: '/app/tags', icon: <LocalOfferIcon fontSize="small" /> }. Import LocalOfferIcon from @mui/icons-material/LocalOffer.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>TagSelector renders; idea form includes TagSelector; sidebar shows Tags link.</done>
</task>

</tasks>

<verification>
- curl GET /api/tags returns 200
- curl POST /api/tags with valid body returns 201
- Visit /app/tags: list loads
- Create tag via /app/tags/new
- Edit tag via /app/tags/[id]
- Delete tag
- /app/ideas/new: TagSelector visible, can select tags, submit includes tags
</verification>

<success_criteria>
- Tag CRUD API complete
- Tag list, create, edit pages functional
- TagSelector in idea form
- Sidebar links to Tags
</success_criteria>

<output>
After completion, create .planning/phases/sprint3/sprint3-01-SUMMARY.md
</output>
