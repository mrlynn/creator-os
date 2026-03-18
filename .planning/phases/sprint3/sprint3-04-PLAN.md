---
phase: sprint3
plan: 04
type: execute
wave: 4
depends_on: [sprint3-03]
files_modified:
  - package.json
  - src/components/scripts/ScriptVersionDiff.tsx
  - src/app/app/scripts/[id]/page.tsx
autonomous: true
requirements: [S3-SCRIPT-VER-01]

must_haves:
  truths:
    - "User can see script version history in Script Studio"
    - "User can compare two versions with diff view"
  artifacts:
    - path: src/components/scripts/ScriptVersionDiff.tsx
      provides: "Version list + diff viewer"
      min_lines: 80
  key_links:
    - from: src/app/app/scripts/[id]/page.tsx
      to: "script.versions"
      via: "ScriptVersionDiff receives versions prop"
---

<objective>
Deliver Script version history + diff in Script Studio: version list and diff view using react-diff-viewer-continued.

Purpose: Script.versions exists with { version, content, createdAt }. Content is JSON of sections. Add UI to view and compare versions.
Output: ScriptVersionDiff component, Version history accordion/tab in Script Studio.
</objective>

<execution_context>
@/Users/michael.lynn/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michael.lynn/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint3/RESEARCH.md
@CLAUDE.md
@src/lib/db/models/Script.ts
@src/app/api/scripts/[id]/route.ts
@src/app/app/scripts/[id]/page.tsx
</context>

<interfaces>
From src/lib/db/models/Script.ts:
IScriptVersion: { version: number, content: string, createdAt: Date }
content: JSON string of { hook, problem, solution, demo, cta, outro }

From src/app/api/scripts/[id]/route.ts:
- GET returns script with versions array (no populate needed)
- PUT pushes new version on save
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Install react-diff-viewer-continued</name>
  <files>package.json</files>
  <action>
Run: npm install react-diff-viewer-continued

No code changes. Dependency only.
  </action>
  <verify>
    <automated>npm ls react-diff-viewer-continued 2>&1 | grep -q react-diff-viewer-continued</automated>
  </verify>
  <done>Package installed.</done>
</task>

<task type="auto">
  <name>Task 2: ScriptVersionDiff component</name>
  <files>src/components/scripts/ScriptVersionDiff.tsx</files>
  <action>
Create src/components/scripts/ScriptVersionDiff.tsx:

1. Props: versions: Array<{ version: number, content: string, createdAt: Date }>

2. Helper: contentToDisplayText(content: string): string
   - Parse content as JSON. Extract keys in order: hook, problem, solution, demo, cta, outro.
   - For each key, append "## {Key}\n{value}\n" (e.g. "## Hook\n{content}\n").
   - Return concatenated string. Handle parse errors: return content as-is if invalid JSON.

3. Version list: Display versions in reverse order (newest first). Each: version number, createdAt (formatted), "Compare" or select for diff. When two versions selected (e.g. v1 vs v2), show diff.

4. Diff view: Use ReactDiffViewer from react-diff-viewer-continued.
   - oldValue = contentToDisplayText(olderVersion.content)
   - newValue = contentToDisplayText(newerVersion.content)
   - splitView={true} (or false for unified)
   - showDiffOnly={false}

5. Edge cases:
   - No versions: show "No version history yet. Save the script to create versions."
   - Single version: show "Only one version. Save again to compare."
   - First version: nothing to diff — show single version content as read-only.

Use MUI Accordion or Box for layout. Match Script Studio styling.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>ScriptVersionDiff renders; diff view works for two versions.</done>
</task>

<task type="auto">
  <name>Task 3: Wire ScriptVersionDiff into Script Studio</name>
  <files>src/app/app/scripts/[id]/page.tsx</files>
  <action>
In src/app/app/scripts/[id]/page.tsx:
- Add "Version History" as new Tab (or Accordion) alongside existing tabs (Script, Hooks, etc.).
- Pass script.versions to ScriptVersionDiff: <ScriptVersionDiff versions={script?.versions || []} />
- Ensure script fetch includes versions (GET /api/scripts/[id] already returns full script with versions).

Import ScriptVersionDiff from @/components/scripts/ScriptVersionDiff.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Script Studio shows Version History tab with diff.</done>
</task>

</tasks>

<verification>
- react-diff-viewer-continued installed
- Script Studio has Version History
- Diff view compares two versions correctly
</verification>

<success_criteria>
- Version history visible in Script Studio
- Diff view compares two versions
- Content displayed as readable sections
</success_criteria>

<output>
After completion, create .planning/phases/sprint3/sprint3-04-SUMMARY.md
</output>
