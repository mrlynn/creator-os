# Sprint 2: Publishing Calendar, Audience Calibration, Virality Score, Analytics — Research

**Researched:** 2026-03-18  
**Domain:** Full-stack Next.js 14, Material-UI, MongoDB, AI integration  
**Confidence:** HIGH

## Summary

Sprint 2 delivers four features across Publishing Pipeline, Script Studio, Idea Bank, and Analytics Dashboard. The codebase already provides most foundational pieces: Episode and PublishingRecord models with `scheduledDate`/`publishedDate`, ContentIdea with `viralityScore`/`viralityReasoning`, Script generator with audience-level support, AnalyticsSnapshot model and Zod schema, and a disabled Analytics sidebar link. Implementation requires: (1) a calendar API and FullCalendar UI for episodes by publish/schedule date, (2) a new script rewrite endpoint and UI toggle for audience calibration, (3) a virality scorer module and integration into idea creation flow, and (4) analytics CRUD API, page, and sidebar enablement.

**Primary recommendation:** Implement in order: Virality Score (smallest, unblocks idea UX) → Analytics (reuses existing model) → Audience Calibration (extends existing script generator) → Publishing Calendar (new API + UI).

---

## Standard Stack

### Core (Existing)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.x | App Router, API routes | Project standard |
| Material-UI | 5.15.x | UI components | Project standard |
| MongoDB + Mongoose | 8.3.x | Data persistence | Project standard |
| OpenAI | 4.52.x | GPT-4 for AI features | Project standard |
| Zod | 3.23.x | Validation | Project standard |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fullcalendar/core | ^6.x | Calendar core | Publishing calendar view |
| @fullcalendar/react | ^6.x | React adapter | Publishing calendar view |
| @fullcalendar/daygrid | ^6.x | Month/week grid | Publishing calendar view |
| @fullcalendar/list | ^6.x | List view | Optional: list by date |

**Installation:**
```bash
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/list
```

**Note:** FullCalendar core + daygrid + list are MIT licensed. Premium plugins (resource timeline, etc.) require a license; not needed for Sprint 2.

---

## Architecture Patterns

### Recommended Project Structure (Additions)
```
src/
├── app/
│   ├── app/
│   │   ├── pipeline/
│   │   │   └── page.tsx          # Add calendar tab/view
│   │   └── analytics/
│   │       └── page.tsx          # NEW: Analytics page
│   └── api/
│       ├── ideas/
│       │   └── [id]/score/route.ts   # NEW: POST virality score
│       ├── scripts/
│       │   └── [id]/rewrite/route.ts  # NEW: POST audience rewrite
│       ├── analytics-snapshots/route.ts   # NEW: CRUD
│       ├── analytics-snapshots/[id]/route.ts  # NEW
│       └── calendar/route.ts      # NEW: episodes by date
├── lib/
│   └── ai/
│       └── virality-scorer.ts     # NEW: GPT-4 virality scoring
└── components/
    └── shared-ui/
        └── AppSidebar.tsx        # Enable Analytics link
```

### Pattern 1: AI Integration (Existing)
**What:** OpenAI calls via `getOpenAIClient()`, structured prompts, `logAiUsage()` fire-and-forget.  
**When to use:** All new AI features (virality, rewrite).  
**Example:** See `src/lib/ai/script-generator.ts` — returns `{ success, data/error, tokensUsed, durationMs }`.

### Pattern 2: API Route Structure (Existing)
**What:** Next.js App Router `route.ts`, `connectToDatabase()`, `getServerSession()`, Zod validation, `Response.json()`.  
**When to use:** All new endpoints.  
**Example:** See `src/app/api/ideas/route.ts`, `src/app/api/scripts/[id]/generate/route.ts`.

### Pattern 3: Calendar Event Shape
**What:** FullCalendar expects `{ title, date, id?, extendedProps? }`.  
**When to use:** Mapping PublishingRecord + Episode to calendar events.  
**Example:**
```typescript
// Map: Episode + PublishingRecord[] → FullCalendar events
events = records.flatMap((rec) => {
  const date = rec.scheduledDate || rec.publishedDate;
  if (!date) return [];
  return [{
    id: rec._id,
    title: `${episode.title} (${rec.platform})`,
    date: new Date(date).toISOString().slice(0, 10),
    extendedProps: { episodeId, platform: rec.platform }
  }];
});
```

### Anti-Patterns to Avoid
- **Don't add virality scoring synchronously in POST /api/ideas:** Use fire-and-forget or a separate "Score" action to avoid blocking idea creation on AI latency.
- **Don't hand-roll a calendar:** Use FullCalendar; custom grid is error-prone for date handling and timezones.
- **Don't duplicate audience logic:** Script generator already accepts `audienceLevel`; reuse `generateScriptFromOutline` for rewrite, passing current script sections as "outline".

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar UI | Custom grid, date math | FullCalendar daygrid + list | Date/timezone edge cases, accessibility, mobile |
| Virality prompt | Ad-hoc string | Structured module like script-generator | Consistency, logging, error handling |
| Analytics CRUD | Custom validation | CreateAnalyticsSnapshotSchema, UpdateAnalyticsSnapshotSchema | Zod already defines shape |

**Key insight:** FullCalendar handles DST, locale, and event overlap. Custom solutions often miss these.

---

## Feature 1: Publishing Calendar View

### Data Flow
1. **Source:** `PublishingRecord` has `scheduledDate`, `publishedDate`, `episodeId`, `platform`. `Episode` has `title`, `ideaId`, `publishingRecords` (refs).
2. **API:** New `GET /api/calendar?start=&end=` (or `GET /api/episodes?forCalendar=true&start=&end=`) that returns episodes with populated publishing records, filtered by date range.
3. **Mapping:** For each record with `scheduledDate` or `publishedDate`, emit one calendar event. Use `scheduledDate` when status is `scheduled`, else `publishedDate`.
4. **UI:** FullCalendar in Pipeline page — either a tab alongside Kanban or a separate `/app/pipeline/calendar` route. Month view (`dayGridMonth`) primary; list view optional.

### Existing Code to Reuse
- `Episode.find().populate('publishingRecords')` — already used in `GET /api/episodes`
- `PublishingRecord` indexes: `{ publishedDate: -1 }`, `{ episodeId: 1 }`
- Pipeline page: `src/app/app/pipeline/page.tsx` — add Tabs (Kanban | Calendar) or link to calendar subpage

### Edge Cases
- Episodes with no publishing records: exclude from calendar (or show in "unscheduled" section if desired).
- Multiple records per episode (e.g., YouTube + TikTok): one event per record, title includes platform.
- Timezone: Store dates as UTC; FullCalendar uses local time by default. Use `date` (all-day) or `start`/`end` (timed) as needed.

### Implementation Notes
- Add `scheduledDate` index to PublishingRecord if querying by date range (index exists for `publishedDate`).
- Query: `PublishingRecord.find({ $or: [{ scheduledDate: { $gte, $lte } }, { publishedDate: { $gte, $lte } }] }).populate('episodeId')` or aggregate episodes with records in range.

---

## Feature 2: Audience Calibration Toggle

### Data Flow
1. **UI:** Toggle in Script Studio (Tab 0 or Tab 1): "Beginner" | "Advanced". Default from idea's `audience` or last generation.
2. **API:** New `POST /api/scripts/[id]/rewrite` with body `{ audience: 'beginner' | 'advanced' }`.
3. **Logic:** Build "outline" from current script sections (hook + problem + solution + demo + cta + outro), call `generateScriptFromOutline(outline, audience)`, update script sections with result.
4. **Response:** Updated script, tokens used.

### Existing Code to Reuse
- `generateScriptFromOutline(outline, audienceLevel)` — already supports beginner/intermediate/advanced
- `GenerateScriptSchema` has `audience` optional — add `RewriteScriptSchema` with `audience` required
- Script detail page: `src/app/app/scripts/[id]/page.tsx` — add ToggleButtonGroup or SegmentedControl for Beginner/Advanced near "Generate Script"
- Generate flow: `handleGenerate` passes `audience: 'beginner'` hardcoded — change to use toggle state

### Edge Cases
- Script has no content: Disable toggle or show message "Generate script first".
- "Intermediate" vs "Advanced": PRD says Beginner/Advanced; Script model has no audience field. Use idea's audience as default; toggle overrides for rewrite only.
- Mixed audience: Map "mixed" idea audience to "beginner" as default for generation.

### Implementation Notes
- Reuse `generateScriptFromOutline`; no new AI module needed.
- Add `RewriteScriptSchema = z.object({ audience: z.enum(['beginner', 'advanced']) })`.
- Log usage as `script-generation` (or add `script-rewrite` category to usage-logger if desired).

---

## Feature 3: AI Virality Score on Idea Save

### Data Flow
1. **Trigger options:** (a) Fire-and-forget after POST /api/ideas (recommended), or (b) Explicit "Score" button on idea detail. PRD says "on save" — implement as async after create.
2. **API:** Option A: In POST /api/ideas, after `ContentIdea.create()`, call `scoreVirality(idea)` without awaiting, return 201 immediately. Option B: New `POST /api/ideas/[id]/score` for manual trigger.
3. **Module:** `src/lib/ai/virality-scorer.ts` — `scoreVirality(idea): Promise<{ viralityScore, viralityReasoning }>`.
4. **Prompt:** GPT-4 with idea title, description, platform, audience, format. Return JSON `{ viralityScore: 0-100, viralityReasoning: string }`.
5. **Update:** `ContentIdea.findByIdAndUpdate(id, { viralityScore, viralityReasoning })`.
6. **Logging:** `logAiUsage({ category: 'virality-scoring', ... })` — category already exists in usage-logger.

### Existing Code to Reuse
- `ContentIdea` model: `viralityScore`, `viralityReasoning` already defined
- `logAiUsage` supports `virality-scoring`, `relatedDocumentId`, `relatedDocumentType`
- Idea detail page shows virality when present: `src/app/app/ideas/[id]/page.tsx`, `IdeaCard.tsx`
- Create flow: `src/app/api/ideas/route.ts` — add fire-and-forget call after create

### Edge Cases
- AI failure: Don't block idea creation. Log error; idea remains without score. Optional: "Score" button to retry.
- Idempotency: Scoring same idea twice is fine; overwrites previous score.
- Rate limits: Fire-and-forget avoids blocking; consider queue if many ideas created in burst.

### Implementation Notes
- Use `getOpenAIClient()` and same error-handling pattern as script-generator.
- Zod schema for AI response: `z.object({ viralityScore: z.number().min(0).max(100), viralityReasoning: z.string() })`.
- Recommendation: Implement both (a) fire-and-forget on create and (b) manual "Score" button for retry/on-demand.

---

## Feature 4: Analytics Page (Basic)

### Data Flow
1. **Enable sidebar:** Remove `disabled: true` from Analytics nav item in `AppSidebar.tsx`.
2. **Page:** New `src/app/app/analytics/page.tsx` — list episodes with their snapshots, form to add snapshot.
3. **API:** New `GET/POST /api/analytics-snapshots`, `GET/PUT/DELETE /api/analytics-snapshots/[id]`.
4. **Form:** Episode selector (dropdown), platform, snapshotDate, viewCount, likeCount, commentCount, shareCount, optional watchTimeMinutes, engagement.
5. **List:** Table or cards per episode, showing snapshots for that episode.

### Existing Code to Reuse
- `AnalyticsSnapshot` model: episodeId, platform, snapshotDate, viewCount, likeCount, commentCount, shareCount, watchTimeMinutes, clickThroughRate, engagement
- `CreateAnalyticsSnapshotSchema` in schemas.ts — extend if needed (e.g., clickThroughRate optional)
- `Episode` model and GET /api/episodes for episode selector
- Recharts already in package.json for future charts (Sprint 2 is form + list only)

### Schema Check
- `CreateAnalyticsSnapshotSchema` has: episodeId, platform, snapshotDate, viewCount, likeCount, commentCount, shareCount, watchTimeMinutes (optional), engagement (optional). Missing clickThroughRate — add as optional if desired.
- Model has `clickThroughRate` — add to Create schema as optional for consistency.

### Edge Cases
- No episodes: Show empty state, disable episode selector or show message.
- Multiple snapshots per episode: List groups by episode; allow multiple entries per episode (different snapshotDate or platform).
- Date format: Use datetime-local or date picker; store as Date in MongoDB.

### Implementation Notes
- Add `UpdateAnalyticsSnapshotSchema` for PUT (partial update).
- List view: Fetch episodes with `populate` or fetch snapshots grouped by episodeId.
- Consider `GET /api/analytics-snapshots?episodeId=` for filtering.

---

## Dependencies and Integration Points

| Feature | Depends On | Integrates With |
|--------|------------|-----------------|
| Calendar | Episodes API, PublishingRecord | Pipeline page, existing episode cards |
| Audience toggle | Script generator, Script API | Script detail page, Generate flow |
| Virality score | ContentIdea model, OpenAI | Ideas API POST, idea detail page |
| Analytics | AnalyticsSnapshot model, Episodes API | Sidebar, new analytics page |

**Shared:** Auth (getServerSession), DB (connectToDatabase), Zod schemas.

---

## Suggested Implementation Order

1. **Virality Score** — Smallest scope, unblocks idea UX. Add `virality-scorer.ts`, integrate into POST ideas + optional Score button.
2. **Analytics Page** — Model and schema exist. Add API routes, page, form, list; enable sidebar.
3. **Audience Calibration** — Extends existing generator. Add rewrite endpoint, toggle in Script Studio.
4. **Publishing Calendar** — New API + FullCalendar. Add calendar API, Pipeline calendar view/tab.

Rationale: Virality and Analytics are independent and quick. Audience calibration builds on script generator. Calendar requires new API design and FullCalendar setup.

---

## Common Pitfalls

### Pitfall 1: Blocking idea creation on virality
**What goes wrong:** POST /api/ideas waits for GPT-4; slow or failing AI blocks UX.  
**Why it happens:** Synchronous AI call in request handler.  
**How to avoid:** Fire-and-forget `scoreVirality(idea).catch(console.error)` after create; return 201 immediately.  
**Warning signs:** Idea creation takes 5+ seconds.

### Pitfall 2: Calendar timezone confusion
**What goes wrong:** Events show on wrong day.  
**Why it happens:** Mixing UTC and local time.  
**How to avoid:** Store dates as ISO strings/Date in MongoDB; FullCalendar uses local by default for `date` prop. Use `date` for all-day events.  
**Warning signs:** Events shift when user changes timezone.

### Pitfall 3: Rewrite overwriting user edits
**What goes wrong:** User edits script, clicks "Advanced", loses edits.  
**Why it happens:** Rewrite replaces all sections.  
**How to avoid:** By design — rewrite is intentional. Consider confirmation: "This will replace your script with an Advanced version. Continue?"  
**Warning signs:** User confusion if no warning.

### Pitfall 4: Analytics schema mismatch
**What goes wrong:** Form submits clickThroughRate but schema rejects it.  
**Why it happens:** CreateAnalyticsSnapshotSchema doesn't include clickThroughRate.  
**How to avoid:** Add `clickThroughRate: z.number().optional()` to Create schema.  
**Warning signs:** 400 on POST with valid-looking payload.

---

## Code Examples

### Virality Scorer (New Module)
```typescript
// src/lib/ai/virality-scorer.ts
import { getOpenAIClient } from './openai-client';
import { logAiUsage } from './usage-logger';

export async function scoreVirality(idea: {
  _id: string;
  title: string;
  description: string;
  platform: string;
  audience: string;
  format: string;
}) {
  const client = getOpenAIClient();
  const start = Date.now();
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Score content ideas 0-100 for virality. Return JSON: { viralityScore, viralityReasoning }.' },
        { role: 'user', content: JSON.stringify({ title: idea.title, description: idea.description, platform: idea.platform, audience: idea.audience, format: idea.format }) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });
    const text = res.choices[0].message?.content || '{}';
    const parsed = JSON.parse(text);
    logAiUsage({ category: 'virality-scoring', tokensUsed: res.usage?.total_tokens || 0, durationMs: Date.now() - start, success: true, relatedDocumentId: idea._id, relatedDocumentType: 'ContentIdea' }).catch(console.error);
    return { success: true, viralityScore: parsed.viralityScore, viralityReasoning: parsed.viralityReasoning };
  } catch (err) {
    logAiUsage({ category: 'virality-scoring', tokensUsed: 0, durationMs: Date.now() - start, success: false, errorMessage: String(err) }).catch(console.error);
    return { success: false, error: err };
  }
}
```

### FullCalendar Basic Usage
```typescript
// Source: FullCalendar React docs
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

<FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  events={events}
  eventClick={(info) => router.push(`/app/episodes/${info.event.extendedProps.episodeId}`)}
/>
```

### Fire-and-Forget Virality in POST Ideas
```typescript
// In POST /api/ideas, after ContentIdea.create(idea):
scoreVirality(idea).then((result) => {
  if (result.success && result.viralityScore != null) {
    return ContentIdea.findByIdAndUpdate(idea._id, { viralityScore: result.viralityScore, viralityReasoning: result.viralityReasoning });
  }
}).catch(console.error);
return Response.json(idea, { status: 201 });
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Sync AI in request | Fire-and-forget for non-critical AI | Faster response, resilient to AI failures |
| Custom calendar | FullCalendar | Maintained, accessible, timezone-aware |
| Manual metrics only | AnalyticsSnapshot + manual form | Foundation for future charts/insights |

---

## Open Questions

1. **Calendar placement:** Tab within Pipeline vs separate `/app/pipeline/calendar` route?
   - Recommendation: Tab (Kanban | Calendar) keeps context; less navigation.

2. **Virality trigger:** Fire-and-forget only vs also "Score" button?
   - Recommendation: Both — async on create, manual retry on idea detail.

3. **Audience toggle default:** From idea.audience or always "beginner"?
   - Recommendation: From idea.audience; map "mixed" to "beginner".

---

## Sources

### Primary (HIGH confidence)
- Creator OS codebase: models, APIs, script-generator, usage-logger, AppSidebar
- FullCalendar React docs: https://fullcalendar.io/docs/react
- PRD.md: Sprint 2 scope, virality prompt examples

### Secondary (MEDIUM confidence)
- MUI X Date Calendar (for reference; not used for event display)
- OpenAI structured output patterns from script-generator

### Tertiary (LOW confidence)
- Web search for calendar libraries (validated via FullCalendar docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — matches existing project
- Architecture: HIGH — patterns from codebase
- Pitfalls: HIGH — derived from similar features

**Research date:** 2026-03-18  
**Valid until:** ~30 days (stable stack)
