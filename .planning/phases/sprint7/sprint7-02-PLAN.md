---
phase: sprint7
plan: 02
type: execute
wave: 2
depends_on:
  - sprint7-01
files_modified:
  - src/lib/db/schemas.ts
  - src/lib/ai/script-generator.ts
  - src/lib/ai/hook-generator.ts
  - src/lib/ai/virality-scorer.ts
  - src/lib/ai/repurposing-engine.ts
  - src/lib/ai/seo-generator.ts
  - src/lib/ai/evergreen-scorer.ts
  - src/lib/ai/planner.ts
  - src/lib/ai/insight-reporter.ts
  - src/lib/ai/auto-tagger.ts
  - src/app/api/scripts/[id]/generate/route.ts
  - src/app/api/scripts/[id]/hooks/route.ts
  - src/app/api/ideas/[id]/score/route.ts
  - src/app/api/episodes/[id]/repurpose/route.ts
  - src/app/api/episodes/[id]/seo/route.ts
  - src/app/api/episodes/[id]/evergreen/route.ts
  - src/app/api/ai/planner/route.ts
  - src/app/api/ai/insight-report/route.ts
  - src/app/api/episodes/route.ts
  - src/app/api/prompts/[id]/run/route.ts
autonomous: true
requirements:
  - PROFILE-04
must_haves:
  truths:
    - POST /api/scripts/[id]/generate with profileId returns script reflecting profile tone
    - POST /api/scripts/[id]/hooks with profileId returns hooks reflecting profile
    - POST /api/prompts/[id]/run with profileId returns output reflecting profile
    - All 10 AI ops accept optional profileId and prepend profile when provided
  artifacts:
    - path: src/lib/ai/instruction-profile.ts
      provides: getProfileInstruction (from plan 01)
  key_links:
    - from: script-generator.ts
      to: instruction-profile.ts
      via: getProfileInstruction(profileId)
    - from: generate/route.ts
      to: script-generator
      via: pass profileId from body
---

<objective>
Integrate instruction profiles into all 10 AI operations.
Purpose: Persona-based system prompts prepend to every AI op when profileId provided.
Output: profileId param in all AI libs and routes; prepend/add system message per RESEARCH pattern.
</objective>

<context>
@.planning/phases/sprint7/RESEARCH.md
@src/lib/ai/script-generator.ts
@src/lib/ai/hook-generator.ts
@src/lib/ai/virality-scorer.ts
@src/lib/ai/instruction-profile.ts
</context>

<interfaces>
Ops with system prompt: script-gen, virality, repurpose, seo, evergreen, planner, insight-report, auto-tagger — prepend profile to system
Ops with user-only: hook-gen, prompt-run — add system message when profile provided
getProfileInstruction(profileId): Promise&lt;string&gt; — returns instruction text or ''
Applicable operations: script-generation, hook-generation, virality-scoring, repurposing, seo-generation, evergreen-scoring, planner, insight-report, tagging, prompt-run
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add profileId to schemas and API routes</name>
  <files>src/lib/db/schemas.ts, src/app/api/scripts/[id]/generate/route.ts, src/app/api/scripts/[id]/hooks/route.ts, src/app/api/ideas/[id]/score/route.ts, src/app/api/episodes/[id]/repurpose/route.ts, src/app/api/episodes/[id]/seo/route.ts, src/app/api/episodes/[id]/evergreen/route.ts, src/app/api/ai/planner/route.ts, src/app/api/ai/insight-report/route.ts, src/app/api/episodes/route.ts, src/app/api/prompts/[id]/run/route.ts</files>
  <action>
1. Schemas: Add profileId: z.string().optional() to GenerateScriptSchema, GenerateHooksSchema, CreateEpisodeSchema
2. For routes without formal schema (repurpose, seo, evergreen, planner, insight-report, prompt-run): parse body.profileId from request.json() and pass to AI lib
3. generate/route: pass validationResult.data.profileId to generateScriptFromOutline
4. hooks/route: pass body.profileId to generateHooks
5. ideas/score: parse body.profileId, pass to scoreVirality
6. repurpose/route: parse body.profileId, pass to generateClipConcepts
7. seo/route: parse body.profileId, pass to generateSeo
8. evergreen/route: parse body.profileId, pass to scoreEvergreen
9. planner/route: parse body.profileId, pass to generateWeeklyPlan
10. insight-report/route: parse body.profileId, pass to generateWeeklyReport
11. episodes/route: add profileId to CreateEpisodeSchema, pass to autoTagEpisode(episodeId, profileId)
12. prompts/[id]/run: parse body.profileId, pass to chat completion (Task 3)
</action>
  <verify>npm run build</verify>
  <done>All routes accept and forward profileId</done>
</task>

<task type="auto">
  <name>Task 2: Integrate profile into AI libs with system prompt</name>
  <files>src/lib/ai/script-generator.ts, src/lib/ai/virality-scorer.ts, src/lib/ai/repurposing-engine.ts, src/lib/ai/seo-generator.ts, src/lib/ai/evergreen-scorer.ts, src/lib/ai/planner.ts, src/lib/ai/insight-reporter.ts, src/lib/ai/auto-tagger.ts</files>
  <action>
For each lib: add optional profileId param. At start: profilePrefix = profileId ? await getProfileInstruction(profileId) : ''. Prepend to system: systemPrompt = profilePrefix ? `${profilePrefix}\n\n${baseSystemPrompt}` : baseSystemPrompt.
1. script-generator: generateScriptFromOutline(outline, audienceLevel, profileId?)
2. virality-scorer: scoreVirality(idea, profileId?)
3. repurposing-engine: generateClipConcepts(script, title, platform, profileId?)
4. seo-generator: generateSeo(episode, profileId?)
5. evergreen-scorer: scoreEvergreen(episode, profileId?)
6. planner: generateWeeklyPlan({ ideas, publishedRecently, weekOf }, profileId?)
7. insight-reporter: generateWeeklyReport({ metricsData, previousWeekData, weekOf }, profileId?)
8. auto-tagger: autoTagEpisode(episodeId, profileId?) — add profileId param
</action>
  <verify>npm run build</verify>
  <done>All system-prompt libs prepend profile when profileId provided</done>
</task>

<task type="auto">
  <name>Task 3: Integrate profile into user-only AI ops (hook-gen, prompt-run)</name>
  <files>src/lib/ai/hook-generator.ts, src/app/api/prompts/[id]/run/route.ts</files>
  <action>
1. hook-generator: generateHooks(scriptContent, audienceLevel, profileId?). When profileId: messages = [{ role: 'system', content: await getProfileInstruction(profileId) }, { role: 'user', content: youtubePrompt }]. Apply to both youtube and tiktok completions.
2. prompt-run route: when body.profileId, build messages = [{ role: 'system', content: await getProfileInstruction(profileId) }, { role: 'user', content: filledTemplate }]; else messages = [{ role: 'user', content: filledTemplate }]
3. Ensure connectToDatabase() before getProfileInstruction (helper uses DB)
</action>
  <verify>npm run build; POST with profileId returns output reflecting profile</verify>
  <done>Hook-gen and prompt-run add system message when profile provided</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/scripts/[id]/generate with { outline, profileId } returns script
- POST /api/scripts/[id]/hooks with { scriptContent, profileId } returns hooks
- POST /api/prompts/[id]/run with { variables, profileId } returns output
</verification>

<success_criteria>
- All 10 AI ops accept profileId
- Ops with system prompt: prepend pattern
- Ops with user-only: add system message pattern
- No breaking changes when profileId omitted
</success_criteria>
