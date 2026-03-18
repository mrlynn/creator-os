---
phase: sprint6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/seo-generator.ts
  - src/app/api/episodes/[id]/seo/route.ts
  - src/app/app/library/[id]/page.tsx
autonomous: true
requirements:
  - SEO-01
  - SEO-02
must_haves:
  truths:
    - POST /api/episodes/[id]/seo returns titles, recommendedTitle, description, tags
    - Episode detail page has "Generate SEO" button that calls the API
  artifacts:
    - path: src/lib/ai/seo-generator.ts
      provides: generateSeo(episode)
    - path: src/app/api/episodes/[id]/seo/route.ts
      provides: POST handler
    - path: src/app/app/library/[id]/page.tsx
      provides: Generate SEO button
  key_links:
    - from: seo/route.ts
      to: repurpose/route.ts
      via: Episode fetch + script extraction pattern
    - from: seo-generator.ts
      to: usage-logger.ts
      via: logAiUsage({ category: 'seo-generation' })
---

<objective>
SEO title + description generator: GPT-4 with PRD Prompt 6; 5 title options, description, 15–20 tags.
Purpose: "20 min/video" saved for YouTube SEO; on-demand generation.
Output: seo-generator.ts, POST /api/episodes/[id]/seo, "Generate SEO" button on episode detail.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@src/app/api/episodes/[id]/repurpose/route.ts
@src/lib/ai/virality-scorer.ts
@src/lib/ai/repurposing-engine.ts
@src/app/app/library/[id]/page.tsx
</context>

<interfaces>
From repurpose route: getServerSession(), connectToDatabase(), Episode.findById(id).populate('scriptId'), Types.ObjectId.isValid
From virality-scorer: getOpenAIClient(), logAiUsage(), response_format: { type: 'json_object' }
Script extraction: sections = [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')
Episode.tags: ObjectIds; populate and pass tag names to prompt
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create seo-generator.ts with PRD Prompt 6</name>
  <files>src/lib/ai/seo-generator.ts</files>
  <action>
1. Create src/lib/ai/seo-generator.ts
2. Import getOpenAIClient from './openai-client', logAiUsage from './usage-logger'
3. Export async function generateSeo(episode: { title: string; scriptText: string; tags: string[] }): Promise&lt;{ success: true; data: { titles: string[]; recommendedTitle: string; description: string; tags: string[] } } | { success: false; error: string }&gt;
4. Use PRD Prompt 6 verbatim:
   - System: "You are a YouTube SEO specialist for developer and AI education content."
   - User: Video working title: {{title}}, Key topics covered: {{tags}}, Script summary or first 500 words: {{script}}
   - Generate: 5 TITLE OPTIONS, DESCRIPTION (first 2 lines, full 300–500 words, timestamps placeholder, links section), Tags list 15–20
   - Return JSON: { titles, recommendedTitle, description, tags }
5. Truncate script to first 500 words if longer
6. Use response_format: { type: 'json_object' }, model gpt-4-turbo
7. Parse JSON; strip ```json wrapper if present; validate structure
8. logAiUsage({ category: 'seo-generation', tokensUsed, durationMs, success, relatedDocumentId, relatedDocumentType: 'Episode' })
9. Handle empty script: use title + tags only; or return error if no content
  </action>
  <verify>npm run build</verify>
  <done>generateSeo() returns { titles, recommendedTitle, description, tags } for valid episode</done>
</task>

<task type="auto">
  <name>Task 2: Create POST /api/episodes/[id]/seo</name>
  <files>src/app/api/episodes/[id]/seo/route.ts</files>
  <action>
1. Create src/app/api/episodes/[id]/seo/route.ts
2. getServerSession(); return 401 if !session?.user?.email
3. connectToDatabase()
4. Validate params.id with Types.ObjectId.isValid; return 400 if invalid
5. Episode.findById(params.id).populate('scriptId').populate('tags'); return 404 if not found
6. Extract script: sections = [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n')
7. If no script: use episode.title + (episode.description || '') + tag names; or return 400 "Episode has no content"
8. Build tags string: populated tags .map(t =&gt; t.name).join(', ') or empty string
9. Call generateSeo({ title: episode.title, scriptText: scriptText or (episode.description || ''), tags: tagNames })
10. Return Response.json(result.data) on success; 500 on failure
  </action>
  <verify>curl -X POST /api/episodes/{id}/seo returns 200 with titles, description, tags</verify>
  <done>API returns SEO data for episode with script</done>
</task>

<task type="auto">
  <name>Task 3: Add Generate SEO button on episode detail</name>
  <files>src/app/app/library/[id]/page.tsx</files>
  <action>
1. Add state: seoLoading, seoError, seoData (titles, recommendedTitle, description, tags)
2. Add "Generate SEO" button near Repurpose button (same pattern as handleRepurpose)
3. On click: POST /api/episodes/{id}/seo, set seoData
4. Display result in Accordion or expandable section: titles list, recommendedTitle, description (copyable), tags
5. Add copy-to-clipboard for description and tags (reuse ContentCopyIcon pattern from repurpose)
6. Handle loading and error states
  </action>
  <verify>npm run build; manual: click Generate SEO on episode detail, see titles/description/tags</verify>
  <done>Button triggers API; result displayed with copy support</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/episodes/[id]/seo returns { titles, recommendedTitle, description, tags }
- Episode detail page shows Generate SEO button and displays result
</verification>

<success_criteria>
- PRD Prompt 6 used verbatim
- Script extraction matches repurpose pattern
- seo-generation category in logAiUsage
</success_criteria>
