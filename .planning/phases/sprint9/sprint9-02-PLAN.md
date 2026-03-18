---
phase: sprint9
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/app/pipeline/page.tsx
autonomous: true
requirements:
  - META-04
must_haves:
  truths:
    - "User can copy episode metadata from pipeline kanban card without opening episode"
  artifacts:
    - path: src/app/app/pipeline/page.tsx
      provides: "Quick copy metadata button on pipeline card"
  key_links:
    - from: "pipeline/page.tsx"
      to: "episode data"
      via: "episode.title, episode.description, episode.tags"
      pattern: "episode\.(title|description|tags)"
---

<objective>
Pipeline card quick copy: Add "Copy metadata" button to pipeline kanban episode cards.
Purpose: Quick export without navigating to Library episode detail.
Output: Copy metadata button on each pipeline card.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/sprint9/RESEARCH.md

Pipeline: src/app/app/pipeline/page.tsx — Kanban columns, episode cards with title, Publish button.
Episodes fetched from GET /api/episodes — already populates tags, ideaId, scriptId, seriesId, publishingRecords.
Episode interface in pipeline: title, editingStatus, publishingStatus, ideaId, publishingRecords. Need to add description and tags for copy.
</context>

<interfaces>
Pipeline Episode (extend):
- episode.title: string
- episode.description?: string (add if not in response — API returns it)
- episode.tags?: { _id: string; name: string }[]
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Extend pipeline Episode interface and add Copy metadata button</name>
  <files>src/app/app/pipeline/page.tsx</files>
  <action>
1. Extend Episode interface: add description?: string, tags?: { _id: string; name: string }[]
2. GET /api/episodes already populates tags and returns description — verify response shape
3. In pipeline card (Paper for each episode), add "Copy" IconButton or small Button next to "Publish"
4. On click: format as YouTube (title + description + tags), copy to clipboard, show Snackbar "Copied metadata"
5. Reuse same format as sprint9-01: title, blank line, description, blank line, tags comma-separated
6. Add Snackbar state if not present (pipeline may have successMessage Snackbar — add copySnackbar or reuse)
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Pipeline card has Copy metadata button; click copies YouTube format and shows Snackbar</done>
</task>

</tasks>

<verification>
- Pipeline episode card shows Copy metadata button
- Click copies title + description + tags (YouTube format)
- Snackbar confirms copy
- Works for episodes with/without description, with/without tags
</verification>

<success_criteria>
- User can copy episode metadata from pipeline kanban without opening Library
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-02-SUMMARY.md`
</output>
