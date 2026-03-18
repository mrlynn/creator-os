---
phase: sprint7
plan: 03
type: execute
wave: 2
depends_on:
  - sprint7-01
files_modified:
  - src/app/app/ai-toolkit/page.tsx
  - src/components/ai/InstructionProfileSelector.tsx
autonomous: true
requirements:
  - PROFILE-05
  - PROFILE-06
must_haves:
  truths:
    - AI Toolkit page has Instruction Profiles section with list, create, edit, delete
    - User can set default profile (only one default)
    - InstructionProfileSelector component renders dropdown of profiles for per-operation use
  artifacts:
    - path: src/app/app/ai-toolkit/page.tsx
      provides: Profiles section (list, create, edit, delete, default)
    - path: src/components/ai/InstructionProfileSelector.tsx
      provides: Reusable profile dropdown
  key_links:
    - from: ai-toolkit/page.tsx
      to: /api/instruction-profiles
      via: fetch GET, POST, PUT, DELETE
    - from: InstructionProfileSelector
      to: /api/instruction-profiles
      via: fetch GET for options
---

<objective>
AI Toolkit Instruction Profiles section and reusable InstructionProfileSelector component.
Purpose: Manage profiles (CRUD, default); provide selector for per-operation UI.
Output: Profiles section on ai-toolkit page, InstructionProfileSelector component.
</objective>

<context>
@.planning/phases/sprint7/RESEARCH.md
@src/app/app/ai-toolkit/page.tsx
@src/app/api/instruction-profiles/route.ts
</context>

<interfaces>
From ai-toolkit page: Prompts section pattern (List, Dialog create/edit, IconButton delete, fetch /api/prompts)
InstructionProfile: { _id, name, instructionText, applicableOperations, isDefault }
GET /api/instruction-profiles returns { data: InstructionProfile[] }
POST body: { name, instructionText, applicableOperations?, isDefault? }
PUT body: same as POST (partial)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add Instruction Profiles section to AI Toolkit</name>
  <files>src/app/app/ai-toolkit/page.tsx</files>
  <action>
1. Add state: profiles (InstructionProfile[]), profileLoading, profileError, createProfileOpen, editProfileOpen, editingProfileId, profileForm { name, instructionText, applicableOperations, isDefault }
2. Add fetchProfiles() calling GET /api/instruction-profiles, set profiles
3. Add "Instruction Profiles" section above or below Prompts section (Typography h5, Paper with List)
4. List items: name, applicableOperations (or "All ops"), isDefault badge, Edit/Delete icons
5. "New Profile" button opens Dialog with TextField name, TextField instructionText (multiline), Checkbox isDefault
6. On create: POST with form; if isDefault, unset others (API handles) or rely on API
7. On edit: PUT with form; same default logic
8. On delete: DELETE with confirm
9. Follow Prompts section pattern: Dialog for create/edit, ListItemSecondaryAction for Edit/Delete
10. applicableOperations: optional multiselect or simple display; for MVP can show "All" or comma-join
</action>
  <verify>npm run build; AI Toolkit shows profiles section, create/edit/delete work</verify>
  <done>Profiles section with full CRUD and default selector</done>
</task>

<task type="auto">
  <name>Task 2: Create InstructionProfileSelector component</name>
  <files>src/components/ai/InstructionProfileSelector.tsx</files>
  <action>
1. Create src/components/ai/InstructionProfileSelector.tsx
2. Props: value: string | null, onChange: (id: string | null) => void, label?: string, size?: 'small' | 'medium'
3. Fetch GET /api/instruction-profiles on mount
4. Render MUI Select or Autocomplete: options = profiles, value = selected id, empty option "None" for no profile
5. Display profile name; optional: show (default) for isDefault
6. Export component for use in script generate, hook lab, prompt run, etc.
</action>
  <verify>npm run build; component renders and selects profile</verify>
  <done>InstructionProfileSelector renders dropdown, fetches profiles, calls onChange</done>
</task>

</tasks>

<verification>
- npm run build passes
- AI Toolkit: list profiles, create, edit, delete, set default
- InstructionProfileSelector renders and allows selection
</verification>

<success_criteria>
- Profiles section matches Prompts section UX pattern
- Selector reusable; can be embedded in script/hook/prompt UIs in future
</success_criteria>
