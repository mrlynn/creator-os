---
phase: sprint9
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/app/library/[id]/page.tsx
autonomous: true
requirements:
  - META-01
  - META-02
  - META-03
must_haves:
  truths:
    - "User can copy episode metadata for YouTube (title, description, tags)"
    - "User can copy episode metadata for TikTok (caption with hashtags)"
    - "User can copy episode metadata as JSON"
  artifacts:
    - path: src/app/app/library/[id]/page.tsx
      provides: "Export metadata UI with Copy for YouTube, TikTok, JSON"
      min_lines: 50
  key_links:
    - from: "library/[id]/page.tsx"
      to: "episode state"
      via: "episode.title, episode.description, episode.tags"
      pattern: "episode\.(title|description|tags)"
---

<objective>
Metadata export on Library episode detail: Copy for YouTube, Copy for TikTok, Copy as JSON.
Purpose: Zero-API publishing prep — creators copy metadata and paste into YouTube Studio / TikTok Creator Studio.
Output: Export metadata section with three copy actions.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/sprint9/RESEARCH.md

Episode model: title, description, tags (ObjectId[] ref Tag, populated as { _id, name }[]).
Library episode detail: src/app/app/library/[id]/page.tsx — episode state, existing Copy patterns (copyToClipboard, copyAllClips, ContentCopyIcon).
</context>

<interfaces>
Episode (from library page):
- episode.title: string
- episode.description?: string
- episode.tags?: { _id: string; name: string }[]
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add Export metadata section</name>
  <files>src/app/app/library/[id]/page.tsx</files>
  <action>
1. Add "Export metadata" section below Tags (or near Generate SEO / Repurpose buttons)
2. Three buttons: "Copy for YouTube", "Copy for TikTok", "Copy as JSON"
3. Copy for YouTube: format as "title\n\n{description}\n\n{tags as comma-separated}". YouTube Studio expects title, description, tags. Use plain text: title, blank line, description, blank line, "Tags: tag1, tag2, tag3"
4. Copy for TikTok: format as caption — title + (description if present) + hashtags. Hashtags from tags: "#" + tag.name (no spaces). Example: "Title here. Description here. #tag1 #tag2"
5. Copy as JSON: JSON.stringify({ title: episode.title, description: episode.description || '', tags: (episode.tags || []).map(t => t.name) }, null, 2)
6. Use existing copyToClipboard / setCopySnackbar pattern. Show Snackbar "Copied for YouTube" / "Copied for TikTok" / "Copied as JSON"
7. Use Material-UI Button with ContentCopyIcon or similar. Stack direction="row" spacing={1}
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Library episode detail has Export metadata section; all three copy actions work and show Snackbar</done>
</task>

</tasks>

<verification>
- Export metadata section visible on episode detail
- Copy for YouTube copies title + description + tags
- Copy for TikTok copies caption with hashtags
- Copy as JSON copies valid JSON
- Snackbar confirms each copy
</verification>

<success_criteria>
- User can copy episode metadata in YouTube, TikTok, and JSON formats from Library episode detail
- No new API routes; client-side only
</success_criteria>

<output>
After completion, create `.planning/phases/sprint9/sprint9-01-SUMMARY.md`
</output>
