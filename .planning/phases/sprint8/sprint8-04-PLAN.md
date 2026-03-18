---
phase: sprint8
plan: 04
type: execute
wave: 2
depends_on: []
files_modified:
  - src/app/app/scripts/[id]/page.tsx
autonomous: true
requirements:
  - KBD-01
  - KBD-02
---

<objective>
Keyboard shortcuts on script editor: Cmd+S / Ctrl+S save, Cmd+Enter generate.
Purpose: Power-user flow; reduce mouse dependency.
</objective>

<context>
- Script detail page has handleSave, handleGenerate
- handleGenerate requires formData.outline (Outline tab)
- Use useEffect with keydown listener, cleanup on unmount
- Prevent default for Cmd+S to avoid browser save dialog
</context>

<tasks>

<task type="auto">
  <name>Task 1: Cmd+S / Ctrl+S save</name>
  <files>src/app/app/scripts/[id]/page.tsx</files>
  <action>
1. Add useEffect for keydown
2. On metaKey+S (Mac) or ctrlKey+S (Win/Linux): e.preventDefault(), call handleSave()
3. Only when !saving and script loaded
4. Cleanup: removeEventListener
  </action>
  <verify>Cmd+S saves script</verify>
</task>

<task type="auto">
  <name>Task 2: Cmd+Enter generate</name>
  <files>src/app/app/scripts/[id]/page.tsx</files>
  <action>
1. On metaKey+Enter or ctrlKey+Enter: e.preventDefault()
2. If tabValue === 0 (Outline tab) and formData.outline and !generating: call handleGenerate()
3. Otherwise no-op
  </action>
  <verify>Cmd+Enter on Outline tab triggers generate</verify>
</task>

</tasks>

<verification>
- Cmd+S saves without opening browser save dialog
- Cmd+Enter generates when on Outline tab with outline content
</verification>
