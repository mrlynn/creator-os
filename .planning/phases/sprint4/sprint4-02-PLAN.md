---
phase: sprint4
plan: 02
type: execute
wave: 2
depends_on: []
files_modified:
  - src/lib/db/models/Prompt.ts
  - src/lib/db/schemas.ts
  - src/lib/ai/usage-logger.ts
  - src/lib/db/models/AiUsageLog.ts
  - src/app/api/prompts/route.ts
  - src/app/api/prompts/[id]/route.ts
  - src/app/api/prompts/[id]/run/route.ts
  - src/app/app/ai-toolkit/page.tsx
  - src/app/app/ai-toolkit/[id]/page.tsx
  - src/components/shared-ui/AppSidebar.tsx
autonomous: true
requirements:
  - PROMPT-01
  - PROMPT-02
  - PROMPT-03
must_haves:
  truths:
    - User can create and save prompts with {{variable}} slots
    - User can run prompt with variable inputs and copy output
  artifacts:
    - path: src/lib/db/models/Prompt.ts
      provides: Prompt model
    - path: src/app/api/prompts/route.ts
      provides: GET, POST prompts
    - path: src/app/api/prompts/[id]/run/route.ts
      provides: POST run
    - path: src/app/app/ai-toolkit/page.tsx
      provides: Prompt list
    - path: src/app/app/ai-toolkit/[id]/page.tsx
      provides: Runner UI
  key_links:
    - from: ai-toolkit/page.tsx
      to: /api/prompts
      via: fetch
    - from: ai-toolkit/[id]/page.tsx
      to: /api/prompts/[id]/run
      via: fetch POST
---

<objective>
Prompt library + runner: Prompt model, CRUD API, /app/ai-toolkit list and runner.
Purpose: Reusable saved prompts with {{variable}} templating for AI operations.
Output: Prompt model, /api/prompts CRUD, /api/prompts/[id]/run, AI Toolkit pages.
</objective>

<context>
@.planning/phases/sprint4/RESEARCH.md
@src/app/api/series/route.ts
@src/app/api/tags/[id]/route.ts
@src/lib/ai/openai-client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Prompt model and schema</name>
  <files>src/lib/db/models/Prompt.ts, src/lib/db/schemas.ts</files>
  <action>
Create Prompt model: name (string, required), template (string, required), variables (string[]), category (string, optional).
- On save: extract variables with template.match(/\{\{(\w+)\}\}/g), unique names, store in variables.
- Add CreatePromptSchema, UpdatePromptSchema in schemas.ts.
- Add 'prompt-run' to usage-logger category and AiUsageLog enum (or use 'other' for runs).
  </action>
  <verify>npm run build</verify>
  <done>Prompt model persists prompts with template and extracted variables</done>
</task>

<task type="auto">
  <name>Task 2: Prompt CRUD API</name>
  <files>src/app/api/prompts/route.ts, src/app/api/prompts/[id]/route.ts</files>
  <action>
GET /api/prompts: list prompts. POST: create with CreatePromptSchema.
GET /api/prompts/[id]: single prompt. PUT: update. DELETE: delete.
Follow patterns from series/route.ts and tags/[id]/route.ts.
connectToDatabase, getServerSession for all.
  </action>
  <verify>curl GET/POST/PUT/DELETE /api/prompts returns expected</verify>
  <done>Full CRUD for prompts</done>
</task>

<task type="auto">
  <name>Task 3: Prompt run API</name>
  <files>src/app/api/prompts/[id]/run/route.ts</files>
  <action>
POST handler. Body: { variables: Record&lt;string, string&gt; }.
Fill template: template.replace(/\{\{(\w+)\}\}/g, (_, k) =&gt; variables[k] ?? '').
OpenAI chat.completions.create with filled template as user message.
logAiUsage category 'other' or 'prompt-run'.
Return { output } or { error }.
  </action>
  <verify>POST run with variables returns completion</verify>
  <done>Prompt run returns AI output</done>
</task>

<task type="auto">
  <name>Task 4: AI Toolkit list and runner</name>
  <files>src/app/app/ai-toolkit/page.tsx, src/app/app/ai-toolkit/[id]/page.tsx, src/components/shared-ui/AppSidebar.tsx</files>
  <action>
Add nav: { label: 'AI Toolkit', href: '/app/ai-toolkit', icon: PsychologyIcon }.
ai-toolkit/page.tsx: fetch /api/prompts, list with Edit/Delete/Run. New Prompt form.
ai-toolkit/[id]/page.tsx: fetch prompt, TextField per variable, Execute button, output + Copy.
  </action>
  <verify>Visit /app/ai-toolkit, create prompt, run, copy output</verify>
  <done>User can manage prompts and run them with variable inputs</done>
</task>

</tasks>

<verification>
- npm run build passes
- AI Toolkit list and runner flow works
</verification>

<success_criteria>
- Prompt CRUD works
- Run returns AI output
- AI Toolkit in sidebar and pages functional
</success_criteria>
