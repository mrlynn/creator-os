---
phase: sprint6
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/planner.ts
  - src/lib/db/models/AiUsageLog.ts
  - src/app/api/ai/planner/route.ts
  - src/app/app/pipeline/page.tsx
autonomous: true
requirements:
  - PLAN-01
  - PLAN-02
must_haves:
  truths:
    - POST /api/ai/planner returns youtube/tiktok arrays, warnings, suggestedNewIdeas
    - Pipeline page has "Plan This Week" button
  artifacts:
    - path: src/lib/ai/planner.ts
      provides: generateWeeklyPlan(ideas, publishedRecently, weekOf)
    - path: src/app/api/ai/planner/route.ts
      provides: POST handler
    - path: src/app/app/pipeline/page.tsx
      provides: Plan This Week button
  key_links:
    - from: planner/route.ts
      to: ContentIdea
      via: status raw|validated, viralityScore
    - from: planner/route.ts
      to: Episode
      via: publishedAt or publishingRecords for recently published
---

<objective>
AI weekly content planner: GPT-4 with PRD Prompt 9; optimal week plan for YouTube + TikTok.
Purpose: "1 hr/week" saved; Pipeline page natural home.
Output: planner.ts, POST /api/ai/planner, "Plan This Week" button on Pipeline.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@src/lib/ai/virality-scorer.ts
@src/lib/db/models/ContentIdea.ts
@src/lib/db/models/Episode.ts
@src/app/app/pipeline/page.tsx
</context>

<interfaces>
PRD Prompt 9 verbatim: Publishing targets 3 YouTube + 5 TikToks/week; weekOf; ideas backlog; publishedRecently
ContentIdea: status, viralityScore, viralityReasoning, platform, audience, title
Episode: publishedAt or use PublishingRecord.publishedAt / Episode.updatedAt as proxy
weekOf: YYYY-MM-DD of Monday; default to current week
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add planner category and create planner.ts</name>
  <files>src/lib/db/models/AiUsageLog.ts, src/lib/ai/planner.ts</files>
  <action>
1. AiUsageLog: add 'planner' to category enum
2. Create src/lib/ai/planner.ts
3. Export async function generateWeeklyPlan(params: { ideas: string; publishedRecently: string; weekOf: string }): Promise&lt;{ success: true; data: { youtube: Array&lt;{ day: string; ideaId?: string; title: string; rationale?: string }&gt;; tiktok: Array&lt;{ day: string; ideaId?: string; title: string; derivedFrom?: string }&gt;; warnings: string[]; suggestedNewIdeas: string[] } } | { success: false; error: string }&gt;
4. Use PRD Prompt 9 verbatim:
   - System: "You are a content calendar strategist for a developer advocate."
   - User: Publishing targets: 3 YouTube videos/week + 5 TikToks/week. Week of: {{weekOf}}. Available ideas in backlog: {{ideas}}. Recently published: {{publishedRecently}}
   - Create optimal week plan: youtube array, tiktok array, warnings, suggestedNewIdeas
5. response_format: { type: 'json_object' }; parse JSON
6. logAiUsage({ category: 'planner', tokensUsed, durationMs, success })
7. Edge case: empty ideas string → return plan with warning "Create more ideas to get recommendations"
  </action>
  <verify>npm run build</verify>
  <done>generateWeeklyPlan() returns plan structure</done>
</task>

<task type="auto">
  <name>Task 2: Create POST /api/ai/planner</name>
  <files>src/app/api/ai/planner/route.ts</files>
  <action>
1. Create src/app/api/ai/planner/route.ts
2. getServerSession(); return 401 if unauthenticated
3. connectToDatabase()
4. Parse body: { weekOf?: string }; default weekOf to Monday of current week (YYYY-MM-DD)
5. Fetch ContentIdea: status in ['raw','validated'], sort by viralityScore desc
6. Build ideas string: each idea as "title | audience | platform | viralityScore" (include _id for ideaId in output)
7. Fetch Episode with publishedAt in last 2 weeks (or use PublishingRecord.publishedAt, Episode.updatedAt); build publishedRecently string
8. Call generateWeeklyPlan({ ideas, publishedRecently, weekOf })
9. Return Response.json(result.data) on success
  </action>
  <verify>curl -X POST /api/ai/planner -H "Content-Type: application/json" -d '{}' returns 200 with youtube/tiktok arrays</verify>
  <done>API returns weekly plan</done>
</task>

<task type="auto">
  <name>Task 3: Add Plan This Week button on Pipeline page</name>
  <files>src/app/app/pipeline/page.tsx</files>
  <action>
1. Add state: planLoading, planError, planData (youtube, tiktok, warnings, suggestedNewIdeas)
2. Add "Plan This Week" button (e.g. in header or near CalendarView)
3. On click: POST /api/ai/planner with optional { weekOf }
4. Display result in Dialog or Accordion: youtube schedule, tiktok schedule, warnings, suggested new ideas
5. Handle empty plan; show warnings
  </action>
  <verify>npm run build; manual: click Plan This Week, see plan</verify>
  <done>Button triggers API; plan displayed</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/ai/planner returns { youtube, tiktok, warnings, suggestedNewIdeas }
- Pipeline page shows Plan This Week button and plan result
</verification>

<success_criteria>
- PRD Prompt 9 used verbatim
- Ideas format: title | audience | platform | viralityScore
- Edge case: no ideas → warning in response
</success_criteria>
