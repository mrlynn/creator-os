---
phase: sprint6
plan: 06
type: execute
wave: 1
depends_on:
  - sprint5-04
files_modified:
  - src/lib/ai/embed-pipeline.ts
  - src/app/api/ideas/route.ts
  - src/app/api/scripts/route.ts
  - src/app/api/episodes/route.ts
autonomous: true
requirements:
  - EMBED-01
must_haves:
  truths:
    - After ContentIdea POST: embed fires in background
    - After Script POST: embed fires in background
    - After Episode POST: embed fires in background
  artifacts:
    - path: src/lib/ai/embed-pipeline.ts
      provides: embedIdea(id), embedScript(id), embedEpisode(id)
    - path: src/app/api/ideas/route.ts
      provides: Hook after POST
    - path: src/app/api/scripts/route.ts
      provides: Hook after POST
    - path: src/app/api/episodes/route.ts
      provides: Hook after POST
  key_links:
    - from: embed-pipeline.ts
      to: embeddings.ts
      via: embed(text)
    - from: ideas/route.ts
      to: embed-pipeline.ts
      via: embedIdea(ideaId).catch(console.error)
---

<objective>
Embed on create: fire-and-forget embed after idea, script, episode create.
Purpose: Populate embeddings automatically; requires Sprint 5 embed pipeline.
Output: embed-pipeline.ts with embedIdea, embedScript, embedEpisode; hooks in POST handlers.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@.planning/phases/sprint5/sprint5-04-PLAN.md
@src/app/api/episodes/[id]/repurpose/route.ts
@src/lib/ai/auto-tagger.ts
@src/lib/ai/embeddings.ts
</context>

<interfaces>
From sprint5-04: embed routes do: fetch doc, build text, embed(), findByIdAndUpdate with embedding
Text extraction: ContentIdea: title + description; Script: sections join; Episode: title + description + scriptText
From embeddings: embed(text)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create embed-pipeline.ts with embedIdea, embedScript, embedEpisode</name>
  <files>src/lib/ai/embed-pipeline.ts</files>
  <action>
1. Create src/lib/ai/embed-pipeline.ts
2. Import embed from './embeddings', ContentIdea/Script/Episode models, connectToDatabase
3. export async function embedIdea(ideaId: string): Promise&lt;void&gt;
   - connectToDatabase()
   - ContentIdea.findById(ideaId)
   - text = `${idea.title}\n\n${idea.description}`.trim()
   - if !text return
   - truncate to ~8000 chars
   - embedding = await embed(text)
   - ContentIdea.findByIdAndUpdate(ideaId, { $set: { embedding } })
4. export async function embedScript(scriptId: string): Promise&lt;void&gt;
   - Script.findById(scriptId)
   - sections = [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')
   - text = `${script.title}\n\n${sections}`.trim()
   - if !text return
   - embedding = await embed(text); Script.findByIdAndUpdate(scriptId, { $set: { embedding } })
5. export async function embedEpisode(episodeId: string): Promise&lt;void&gt;
   - Episode.findById(episodeId).populate('scriptId')
   - scriptText from sections; fullText = title + description + scriptText
   - if !fullText return
   - embedding = await embed(fullText); Episode.findByIdAndUpdate(episodeId, { $set: { embedding } })
6. Use .select('+embedding') only if needed for update; embedding field has select: false
7. Catch errors; do not throw (caller uses .catch(console.error))
  </action>
  <verify>npm run build</verify>
  <done>embedIdea, embedScript, embedEpisode exist and update embedding field</done>
</task>

<task type="auto">
  <name>Task 2: Hook embed in ideas, scripts, episodes POST</name>
  <files>src/app/api/ideas/route.ts, src/app/api/scripts/route.ts, src/app/api/episodes/route.ts</files>
  <action>
1. ideas/route.ts: import embedIdea from '@/lib/ai/embed-pipeline'
   - After ContentIdea.create, before return: embedIdea(idea._id.toString()).catch(console.error)
2. scripts/route.ts: import embedScript from '@/lib/ai/embed-pipeline'
   - After Script.create, before return: embedScript(script._id.toString()).catch(console.error)
3. episodes/route.ts: import embedEpisode from '@/lib/ai/embed-pipeline'
   - After Episode.create, before return: embedEpisode(episode._id.toString()).catch(console.error)
4. Fire-and-forget pattern: do not await; use .catch(console.error)
  </action>
  <verify>npm run build; create idea, verify embedding in DB shortly after</verify>
  <done>All three POST handlers trigger embed on create</done>
</task>

</tasks>

<verification>
- npm run build passes
- Create idea → embedding populated in ContentIdea
- Create script → embedding populated in Script
- Create episode → embedding populated in Episode
- Requires Sprint 5: embedding field on models, embeddings.ts
</verification>

<success_criteria>
- Fire-and-forget; does not block create response
- Text extraction matches embed route pattern
</success_criteria>
