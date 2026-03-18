# Sprint 3: Phase Plan

**Phase goal:** Deliver four features in order: Tag management → Series UI → Content Library → Script version diff.

**Reference:** @.planning/phases/sprint3/RESEARCH.md (authoritative specification)

---

## Wave Structure

| Wave | Plan | Feature | Autonomous |
|------|------|---------|-------------|
| 1 | sprint3-01 | Tag management system | yes |
| 2 | sprint3-02 | Series management UI | yes |
| 3 | sprint3-03 | Content Library | yes |
| 4 | sprint3-04 | Script version history + diff | yes |

---

## Plans (Execution Order)

1. **sprint3-01-PLAN.md** — Tag management
   - Tag CRUD API (`/api/tags`, `/api/tags/[id]`)
   - Tag list, create, edit pages (`/app/tags`, `/app/tags/new`, `/app/tags/[id]`)
   - TagSelector component + wire into IdeaCaptureForm
   - Sidebar: Tags link

2. **sprint3-02-PLAN.md** — Series management UI
   - Extend Episode API: `seriesId` filter
   - Series list, create, detail pages (`/app/series`, `/app/series/new`, `/app/series/[id]`)
   - Sidebar: Series link

3. **sprint3-03-PLAN.md** — Content Library
   - Extend Episode API: `tags` filter, `.populate('tags')`
   - Library page (`/app/library`) with episode list + filters
   - Episode detail (`/app/library/[id]`)
   - Sidebar: Library link

4. **sprint3-04-PLAN.md** — Script version diff
   - Install `react-diff-viewer-continued`
   - ScriptVersionDiff component
   - Version history tab in Script Studio

---

## Dependencies

```
sprint3-01 (Tags) ──► sprint3-02 (Series) ──► sprint3-03 (Library) ──► sprint3-04 (Script diff)
```

- Plan 02 depends on Plan 01 (sidebar, patterns)
- Plan 03 depends on Plan 02 (seriesId filter, episode links)
- Plan 04 depends on Plan 03 (standalone; sequential for incremental commits)

---

## Execution

```bash
# Execute full phase (run each plan in order)
/gsd:execute-phase sprint3

# Or execute individual plan
# (executor reads sprint3-01-PLAN.md, etc.)
```

---

## Verification Summary

| Plan | Key verification |
|------|------------------|
| 01 | `curl /api/tags` 200, create/edit/delete work, TagSelector in idea form |
| 02 | `curl /api/episodes?seriesId=x` works, series pages load |
| 03 | Library filters work, episode detail loads |
| 04 | Script Studio shows Version History, diff compares two versions |

---

## Files Created/Modified (Cumulative)

**Plan 01:** `src/app/api/tags/*`, `src/app/app/tags/*`, `TagSelector.tsx`, `IdeaCaptureForm.tsx`, `AppSidebar.tsx`, `schemas.ts`

**Plan 02:** `src/app/api/episodes/route.ts`, `src/app/app/series/*`, `AppSidebar.tsx`

**Plan 03:** `src/app/api/episodes/*`, `src/app/app/library/*`, `AppSidebar.tsx`

**Plan 04:** `package.json`, `ScriptVersionDiff.tsx`, `scripts/[id]/page.tsx`
