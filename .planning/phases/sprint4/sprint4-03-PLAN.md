---
phase: sprint4
plan: 03
type: execute
wave: 3
depends_on: []
files_modified:
  - src/lib/ai/auto-tagger.ts
  - src/app/api/episodes/route.ts
autonomous: true
requirements:
  - AUTO-TAG-01
  - AUTO-TAG-02
must_haves:
  truths:
    - New episodes get tags automatically after creation
    - Tags match GPT-4 classification; new tags created with category topic
  artifacts:
    - path: src/lib/ai/auto-tagger.ts
      provides: autoTagEpisode(episodeId)
    - path: src/app/api/episodes/route.ts
      provides: Episode POST with fire-and-forget auto-tag
  key_links:
    - from: episodes/route.ts
      to: auto-tagger.ts
      via: autoTagEpisode(id).catch(console.error)
---

<objective>
Auto-tagging on ingest: GPT-4 classification when episode created, match/create tags.
Purpose: Improve Library filter UX with automatic topic tagging.
Output: auto-tagger.ts, hook in Episode POST.
</objective>

<context>
@.planning/phases/sprint4/RESEARCH.md
@src/app/api/episodes/route.ts
@src/lib/db/models/Tag.ts
@src/lib/db/models/Episode.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Auto-tagger module</name>
  <files>src/lib/ai/auto-tagger.ts</files>
  <action>
Create autoTagEpisode(episodeId: string): Promise&lt;void&gt;.
- Fetch Episode.findById(episodeId).populate('scriptId').
- Build text: [hook, problem, solution, demo, cta, outro].filter(Boolean).join('\n\n'); prepend title; first ~500 chars if long.
- GPT-4: "Classify this content. Return JSON: { tags: [\"name1\", \"name2\"] }." response_format json_object.
- For each name: find Tag by slug (name.toLowerCase().replace(/\s+/g, '-')) or name; create if not exists with category 'topic'.
- Episode.findByIdAndUpdate(episodeId, { $set: { tags: tagIds } }).
- logAiUsage({ category: 'tagging' }).
- Use findOneAndUpdate with upsert for tag creation to avoid races.
  </action>
  <verify>npm run build</verify>
  <done>autoTagEpisode assigns tags from classification</done>
</task>

<task type="auto">
  <name>Task 2: Hook into Episode POST</name>
  <files>src/app/api/episodes/route.ts</files>
  <action>
After Episode.create() and before return Response.json():
- Add autoTagEpisode(episode._id.toString()).catch(console.error) — fire-and-forget, do NOT await.
  </action>
  <verify>Create episode via API, episode gets tags (check DB or UI after delay)</verify>
  <done>New episodes auto-tagged asynchronously</done>
</task>

</tasks>

<verification>
- npm run build passes
- Episode creation triggers auto-tag (tags appear)
</verification>

<success_criteria>
- autoTagEpisode classifies and assigns tags
- Episode POST does not block on tagging
</success_criteria>
