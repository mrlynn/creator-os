# Creator OS — AI & Developer Content Creation Platform
### Architecture & Product Specification · v1.0
> MongoDB Developer Advocate · 2026

---

## Executive Summary

Creator OS is a full-stack Next.js 14 + MongoDB Atlas platform purpose-built for a solo developer advocate producing AI & software development content at scale across YouTube, TikTok, and long-form channels. The architecture centers on six core domains — **Idea Bank, Script Studio, Publishing Pipeline, Content Library, Analytics Dashboard, and AI Toolkit** — all backed by a unified Mongoose data model with Atlas Vector Search enabling semantic content discovery and a repurposing engine.

The platform collapses time-to-publish from days to hours by embedding AI at every stage: idea generation from topic seeds, audience-calibrated scripting (beginner vs advanced), platform-optimized hook generation, and a repurposing engine that transforms one long-form script into multiple short-form assets. The "building in public" narrative is baked in — the platform itself becomes content.

---

## Phase 1 — Feature Domains & Architecture

### 1.1 Core Feature Domains

| Domain | Primary Purpose | Key Workflows | Solo Creator ROI |
|---|---|---|---|
| **Idea Bank** | Capture, rank, and validate content ideas | Brainstorm → Tag → Prioritize → Promote | Never lose an idea; always have a ready backlog |
| **Script Studio** | Write and AI-generate scripts | Outline → AI Draft → Calibrate → Finalize | 10x faster scripting with AI co-pilot |
| **Publishing Pipeline** | Schedule and track content lifecycle | Kanban → Calendar → Publish Record | Single source of truth across all platforms |
| **Content Library** | Archive and semantically search all content | Ingest → Tag → Search → Repurpose | One video becomes 5 assets automatically |
| **Analytics Dashboard** | Track performance and surface insights | Log Metrics → Compare → Act on Insights | Know what works before wasting production time |
| **AI Toolkit** | Centralized prompt library and AI operations | Build Prompt → Run → Log → Reuse | Eliminates daily context re-setup |

---

### 1.2 Domain Deep-Dives

#### Domain 1: Idea Bank

**Primary user workflows:** Capture a fleeting idea in under 10 seconds. Review and validate backlog weekly. Promote best ideas into the scripting queue.

**Key features:**
- **Quick-capture form** with voice-to-text (Web Speech API) — title, description, platform tags, audience tag in one shot
- **Audience tag selector:** `AI Curious` / `Experienced Dev` / `Both` — drives downstream AI calibration
- **Platform intent tags:** YouTube Long, TikTok Short, Blog, Thread, Shorts (multi-select)
- **AI virality score** (0–100) estimated on save using GPT-4-turbo based on topic, format, and audience
- **Semantic duplicate detection** — Atlas Vector Search flags ideas within cosine similarity threshold of existing content
- **Status pipeline:** `Raw Idea → Validated → Scripted → Published → Archived`

**Highest ROI:** Quick-capture + AI virality scoring. You capture the idea instantly; the AI tells you whether it's worth pursuing before you invest a second more.

---

#### Domain 2: Script Studio

**Primary user workflows:** Expand a validated idea into a full script. Toggle audience framing. Generate and test hooks. Version and finalize.

**Key features:**
- **Structured editor** with collapsible sections: Hook / Problem / Solution / Demo / CTA / Outro
- **AI Script Generator:** full draft from title + bullet point outline — structured GPT-4-turbo output maps directly to sections
- **Audience calibration toggle:** one-click rewrite of the entire script for Beginner vs Advanced persona
- **Hook Lab:** generates 5 YouTube hooks + 5 TikTok hooks in parallel for the same script (optimized per platform psychology)
- **Read-time estimator** with per-platform guidance (YouTube: 8–12 min = 1,200–1,800 words; TikTok: 30–60 sec = 75–150 words)
- **Version history** with diff view — never lose a previous draft

**Highest ROI:** AI Script Generator from outline. Reduces 4-hour scripting sessions to 45 minutes.

---

#### Domain 3: Publishing Pipeline

**Primary user workflows:** Move content through production stages. Plan weekly calendar. Track what's live where.

**Key features:**
- **Kanban board:** `Idea → Scripting → Recording → Editing → Scheduled → Published` with drag-and-drop
- **Weekly calendar view** — visualizes 3 YouTube + 5 TikTok/week cadence; red-flags gaps
- **Publishing record per asset:** platform, URL, publish date, thumbnail path, description used
- **Content dependency graph:** TikTok clips linked to their parent YouTube video
- **AI weekly planner:** suggests this week's lineup by scoring Idea Bank backlog against content gaps and cadence needs

**Highest ROI:** Kanban board. Keeps the creator unblocked and makes production status visible at a glance.

---

#### Domain 4: Content Library

**Primary user workflows:** Find previously published content. Identify repurposing candidates. Search by topic semantically.

**Key features:**
- **Full archive** of all published content across all platforms with unified metadata
- **Semantic full-text search** via Atlas Vector Search across scripts, titles, and descriptions
- **Repurposing engine:** given a YouTube script, generates 3–5 TikTok clip concepts with timestamps and rewritten hooks
- **Series grouping:** cluster episodes into series/playlists with aggregate metrics
- **Auto-tagging on ingest** using GPT-4 classification — topics, technologies, difficulty, format
- **Evergreen score** (0–100): AI rates content longevity based on topic stability and search intent

**Highest ROI:** Repurposing engine. One YouTube video becomes 3–5 TikToks with minimal marginal effort.

---

#### Domain 5: Analytics Dashboard

**Primary user workflows:** Log performance data after publish. Identify top-performing topics. Adjust content strategy weekly.

**Key features:**
- **Manual metrics entry** (views, likes, comments, watch time, CTR, subscriber delta) per content unit
- **Platform comparison charts:** YouTube vs TikTok engagement rate side-by-side
- **Topic performance heatmap:** which topic clusters (MongoDB, AI Agents, RAG, etc.) drive the most engagement
- **Series rollup:** aggregate metrics across all episodes in a series
- **AI weekly insight report:** natural-language summary of performance with 3 actionable recommendations, generated from your metrics data

**Highest ROI:** Topic performance heatmap. Guides what to produce next based on evidence, not gut.

---

#### Domain 6: AI Toolkit

**Primary user workflows:** Run saved prompts without re-entering context. Monitor AI spend. Build new prompt templates.

**Key features:**
- **Prompt library:** 10+ saved prompts with named variable slots `{{title}}`, `{{audience}}`, `{{script}}`
- **Prompt runner:** fill variables, execute, preview output, copy — all in one panel
- **AI usage log:** per-operation cost tracking (category, model, tokens, estimated USD)
- **Custom instruction profiles:** `Beginner Persona`, `Senior Dev Persona`, `Viral Hook Mode` — prepend to any operation
- **Batch operations:** auto-tag all untagged library items; batch-generate descriptions for unpublished content

**Highest ROI:** Prompt runner with saved templates. Eliminates the 10-minute context re-setup that happens every single session.

---

### 1.3 AI Integration Opportunity Matrix

| Feature | Domain | Time Saved | Model | Approach |
|---|---|---|---|---|
| Script generation from outline | Script Studio | 3–4 hrs/video | GPT-4-turbo | Structured output → section map |
| Audience calibration rewriter | Script Studio | 1 hr/video | GPT-4-turbo | System prompt persona switching |
| Hook Lab (5 YT + 5 TT hooks) | Script Studio | 45 min/video | GPT-4-turbo | `Promise.all` parallel completions |
| Semantic idea deduplication | Idea Bank | 20 min/week | Voyage + Atlas VS | Cosine similarity threshold |
| Virality score on idea save | Idea Bank | 30 min/week | GPT-4-turbo | JSON structured score + reasoning |
| Auto-tagging on content ingest | Content Library | 30 min/week | GPT-4-turbo | Classification prompt → tag array |
| Repurposing engine | Content Library | 2 hrs/clip | GPT-4-turbo | Script chunking + short-form rewriter |
| Weekly AI performance report | Analytics Dashboard | 1 hr/week | GPT-4-turbo | Metrics summary → insight generation |
| Weekly content planner | Publishing Pipeline | 1 hr/week | GPT-4-turbo | Idea ranking + cadence gap analysis |
| SEO title + description generator | AI Toolkit | 20 min/video | GPT-4-turbo | Platform-aware SEO prompt |
| Evergreen content scorer | Content Library | Passive | GPT-4-turbo | Topic stability + search intent rating |

---

## Phase 2 — MongoDB Data Model Design

### 2.1 Entity Relationship Overview

```
ContentIdea ──── Script (1:1)
ContentIdea ──── Episode (1:1, after publishing)
Episode ────────► Series (many:1)
Episode ────────► PublishingRecord[] (1:many, one per platform)
Episode ────────► AnalyticsSnapshot[] (1:many, time-series)
ContentIdea ──── Tag[] (many:many)
Script ──────────► DerivedClip[] (1:many, short-form children)
AiUsageLog ─────► (references any entity via polymorphic refId)
```

---

### 2.2 Core Mongoose Schemas

#### ContentIdea

```typescript
// src/lib/db/models/ContentIdea.ts
import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IContentIdea extends Document {
  title: string;
  description: string;
  status: 'raw' | 'validated' | 'scripted' | 'published' | 'archived';
  platform: ('youtube' | 'tiktok' | 'blog' | 'thread' | 'shorts')[];
  audience: 'beginner' | 'advanced' | 'both';
  format: 'long-form' | 'short-form' | 'tutorial' | 'opinion' | 'demo' | 'reaction';
  tags: Types.ObjectId[];
  series?: Types.ObjectId;
  scriptId?: Types.ObjectId;
  episodeId?: Types.ObjectId;
  aiMetadata: {
    viralityScore: number;        // 0–100
    viralityReason: string;
    seoKeywords: string[];
    suggestedHooks: string[];
    evergreen: boolean;
    difficultyLevel: 1 | 2 | 3 | 4 | 5;
    topicCluster: string;         // e.g. "RAG", "MongoDB Atlas", "AI Agents"
  };
  embedding: number[];            // voyage-4-large, 1024 dims — for semantic search
  createdAt: Date;
  updatedAt: Date;
}

const ContentIdeaSchema = new Schema<IContentIdea>({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  status:      { type: String, enum: ['raw','validated','scripted','published','archived'], default: 'raw' },
  platform:    [{ type: String, enum: ['youtube','tiktok','blog','thread','shorts'] }],
  audience:    { type: String, enum: ['beginner','advanced','both'], required: true },
  format:      { type: String, enum: ['long-form','short-form','tutorial','opinion','demo','reaction'], required: true },
  tags:        [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  series:      { type: Schema.Types.ObjectId, ref: 'Series' },
  scriptId:    { type: Schema.Types.ObjectId, ref: 'Script' },
  episodeId:   { type: Schema.Types.ObjectId, ref: 'Episode' },
  aiMetadata: {
    viralityScore:   { type: Number, min: 0, max: 100 },
    viralityReason:  String,
    seoKeywords:     [String],
    suggestedHooks:  [String],
    evergreen:       Boolean,
    difficultyLevel: { type: Number, min: 1, max: 5 },
    topicCluster:    String,
  },
  embedding: { type: [Number], select: false }, // exclude from default queries
}, { timestamps: true });

ContentIdeaSchema.index({ status: 1, createdAt: -1 });
ContentIdeaSchema.index({ audience: 1, status: 1 });
ContentIdeaSchema.index({ 'aiMetadata.topicCluster': 1 });
ContentIdeaSchema.index({ tags: 1 });

export const ContentIdeaModel = mongoose.models.ContentIdea
  || mongoose.model<IContentIdea>('ContentIdea', ContentIdeaSchema);
```

---

#### Script

```typescript
// src/lib/db/models/Script.ts
export interface IScriptSection {
  type: 'hook' | 'problem' | 'solution' | 'demo' | 'cta' | 'outro' | 'custom';
  label: string;
  content: string;
  wordCount: number;
  notes?: string;
}

export interface IScript extends Document {
  ideaId: Types.ObjectId;
  title: string;
  targetPlatform: 'youtube' | 'tiktok' | 'blog';
  audience: 'beginner' | 'advanced';
  sections: IScriptSection[];
  fullText: string;           // denormalized for search and AI input
  wordCount: number;
  estimatedDuration: number;  // seconds
  hooks: {
    youtube: string[];        // 5 generated hooks
    tiktok: string[];         // 5 generated hooks
    selected?: string;
  };
  versions: {
    versionNumber: number;
    fullText: string;
    savedAt: Date;
    changeNote?: string;
  }[];
  aiGenerated: boolean;
  status: 'draft' | 'review' | 'final' | 'recorded';
  embedding: number[];        // for semantic similarity search, select: false
  createdAt: Date;
  updatedAt: Date;
}

const ScriptSchema = new Schema<IScript>({
  ideaId:           { type: Schema.Types.ObjectId, ref: 'ContentIdea', required: true },
  title:            { type: String, required: true },
  targetPlatform:   { type: String, enum: ['youtube','tiktok','blog'], required: true },
  audience:         { type: String, enum: ['beginner','advanced'], required: true },
  sections:         [{
    type:      { type: String, enum: ['hook','problem','solution','demo','cta','outro','custom'] },
    label:     String,
    content:   String,
    wordCount: Number,
    notes:     String,
  }],
  fullText:          { type: String, required: true },
  wordCount:         Number,
  estimatedDuration: Number,
  hooks: {
    youtube:  [String],
    tiktok:   [String],
    selected: String,
  },
  versions: [{
    versionNumber: Number,
    fullText:      String,
    savedAt:       { type: Date, default: Date.now },
    changeNote:    String,
  }],
  aiGenerated: { type: Boolean, default: false },
  status:      { type: String, enum: ['draft','review','final','recorded'], default: 'draft' },
  embedding:   { type: [Number], select: false },
}, { timestamps: true });

ScriptSchema.index({ ideaId: 1 });
ScriptSchema.index({ status: 1, updatedAt: -1 });
```

---

#### Episode

```typescript
// src/lib/db/models/Episode.ts
export interface IEpisode extends Document {
  ideaId: Types.ObjectId;
  scriptId: Types.ObjectId;
  seriesId?: Types.ObjectId;
  title: string;
  description: string;       // published description (SEO-optimized)
  platform: 'youtube' | 'tiktok' | 'blog' | 'shorts';
  audience: 'beginner' | 'advanced' | 'both';
  format: string;
  tags: Types.ObjectId[];
  status: 'editing' | 'scheduled' | 'published' | 'archived';
  publishedAt?: Date;
  scheduledFor?: Date;
  thumbnailUrl?: string;
  derivedFrom?: Types.ObjectId;  // parent Episode if this is a clip/repurpose
  aiMetadata: {
    autoTags: string[];
    seoTitle: string;
    seoDescription: string;
    topicCluster: string;
    evergreenScore: number;  // 0–100
  };
  embedding: number[];       // select: false
  createdAt: Date;
  updatedAt: Date;
}

EpisodeSchema.index({ platform: 1, status: 1, publishedAt: -1 });
EpisodeSchema.index({ seriesId: 1, publishedAt: 1 });
EpisodeSchema.index({ 'aiMetadata.topicCluster': 1 });
EpisodeSchema.index({ derivedFrom: 1 });  // find all clips from a parent
```

---

#### Series

```typescript
// src/lib/db/models/Series.ts
export interface ISeries extends Document {
  title: string;
  description: string;
  platform: ('youtube' | 'tiktok' | 'blog')[];
  audience: 'beginner' | 'advanced' | 'both';
  status: 'active' | 'completed' | 'paused';
  coverImageUrl?: string;
  episodeCount: number;      // denormalized counter
  totalViews: number;        // denormalized rollup
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### PublishingRecord

```typescript
// src/lib/db/models/PublishingRecord.ts
export interface IPublishingRecord extends Document {
  episodeId: Types.ObjectId;
  platform: 'youtube' | 'tiktok' | 'blog' | 'twitter' | 'linkedin' | 'shorts';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: Date;
  scheduledFor?: Date;
  url?: string;
  platformId?: string;       // YouTube video ID, TikTok post ID, etc.
  thumbnailUrl?: string;
  descriptionUsed: string;
  titleUsed: string;
  tagsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

PublishingRecordSchema.index({ episodeId: 1 });
PublishingRecordSchema.index({ platform: 1, publishedAt: -1 });
PublishingRecordSchema.index({ status: 1, scheduledFor: 1 });
```

---

#### AnalyticsSnapshot

```typescript
// src/lib/db/models/AnalyticsSnapshot.ts
export interface IAnalyticsSnapshot extends Document {
  episodeId: Types.ObjectId;
  platform: 'youtube' | 'tiktok' | 'blog';
  recordedAt: Date;          // date of this snapshot (time-series)
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares?: number;
    watchTimeSeconds?: number;  // YouTube
    ctr?: number;               // YouTube (click-through rate %)
    avgViewDurationSeconds?: number;
    followers_gained?: number;  // TikTok
    saves?: number;             // TikTok
  };
  engagementRate: number;    // computed: (likes+comments+shares)/views
  createdAt: Date;
}

AnalyticsSnapshotSchema.index({ episodeId: 1, recordedAt: -1 });
AnalyticsSnapshotSchema.index({ platform: 1, recordedAt: -1 });
// TTL index option: consider expiring snapshots older than 2 years
```

---

#### Tag

```typescript
// src/lib/db/models/Tag.ts
export interface ITag extends Document {
  name: string;              // e.g. "mongodb", "rag", "langchain", "beginner"
  slug: string;              // url-safe, unique
  category: 'technology' | 'topic' | 'audience' | 'format' | 'custom';
  color: string;             // hex, for UI chips
  usageCount: number;        // denormalized counter for sorting
  createdAt: Date;
}

TagSchema.index({ slug: 1 }, { unique: true });
TagSchema.index({ category: 1, usageCount: -1 });
```

---

#### AiUsageLog

```typescript
// src/lib/db/models/AiUsageLog.ts
export interface IAiUsageLog extends Document {
  category: 'script_gen' | 'hook_lab' | 'virality_score' | 'repurposing'
          | 'auto_tag' | 'seo_gen' | 'insight_report' | 'embedding' | 'other';
  provider: 'openai' | 'voyage';
  model: string;
  operation: 'chat_completion' | 'embedding' | 'streaming';
  tokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUSD: number;
  durationMs: number;
  refId?: Types.ObjectId;    // polymorphic ref to any entity
  refModel?: string;         // 'ContentIdea' | 'Script' | 'Episode'
  error: boolean;
  createdAt: Date;
}

AiUsageLogSchema.index({ category: 1, createdAt: -1 });
AiUsageLogSchema.index({ createdAt: -1 });  // for cost dashboards
```

---

### 2.3 Atlas Vector Search Index Definitions

#### Primary Content Search Index (on `contentideas` + `episodes`)

```json
{
  "name": "content_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1024,
        "similarity": "cosine"
      },
      { "type": "filter", "path": "status" },
      { "type": "filter", "path": "audience" },
      { "type": "filter", "path": "platform" },
      { "type": "filter", "path": "aiMetadata.topicCluster" }
    ]
  }
}
```

#### Script Semantic Search Index (on `scripts`)

```json
{
  "name": "script_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1024,
        "similarity": "cosine"
      },
      { "type": "filter", "path": "targetPlatform" },
      { "type": "filter", "path": "audience" }
    ]
  }
}
```

### 2.4 Indexing Strategy Summary

| Collection | Index | Pattern |
|---|---|---|
| `contentideas` | `{ status, createdAt }` | Kanban board queries |
| `contentideas` | `{ audience, status }` | Filtered idea lists |
| `contentideas` | `{ 'aiMetadata.topicCluster': 1 }` | Analytics heatmap |
| `episodes` | `{ platform, status, publishedAt }` | Library browse |
| `episodes` | `{ seriesId, publishedAt }` | Series episode list |
| `episodes` | `{ derivedFrom: 1 }` | Find all clips of a video |
| `analyticsnapshots` | `{ episodeId, recordedAt }` | Time-series chart data |
| `analyticsnapshots` | `{ platform, recordedAt }` | Platform dashboards |
| `publishingrecords` | `{ status, scheduledFor }` | Publishing calendar |
| `aiusagelogs` | `{ category, createdAt }` | Cost monitoring |
| `tags` | `{ slug }` unique | Tag lookup/autocomplete |

---

## Phase 3 — Application Blueprint

### 3.1 Build Order

#### MVP (Weeks 1–2) — Start creating content immediately

| Priority | Feature | Domain | Why First |
|---|---|---|---|
| 1 | Quick-capture idea form | Idea Bank | Unlocks the capture habit from day 1 |
| 2 | Idea list with status pipeline | Idea Bank | Gives a real backlog to pull from |
| 3 | Script editor with sections | Script Studio | Core daily workflow |
| 4 | AI script generator (outline → draft) | Script Studio | The biggest time save of the whole platform |
| 5 | Kanban board | Publishing Pipeline | Tracks production state |
| 6 | Publishing record + calendar | Publishing Pipeline | Cadence accountability |
| 7 | NextAuth v5 auth | Auth | Required foundation |
| 8 | AI usage logger | AI Toolkit | Always-on cost visibility from day 1 |

#### V1 (Weeks 3–8) — Full platform

| Priority | Feature | Domain |
|---|---|---|
| 9 | Hook Lab (5×5 platform hooks) | Script Studio |
| 10 | Audience calibration toggle | Script Studio |
| 11 | Content Library (archive + browse) | Content Library |
| 12 | Atlas Vector Search + semantic search | Content Library |
| 13 | Auto-tagging on ingest | Content Library |
| 14 | Series management | Content Library |
| 15 | Analytics metrics entry + charts | Analytics Dashboard |
| 16 | Topic performance heatmap | Analytics Dashboard |
| 17 | Repurposing engine (YouTube → TikTok clips) | Content Library |
| 18 | Tag management system | AI Toolkit |
| 19 | Prompt library + runner | AI Toolkit |
| 20 | Script version history + diff | Script Studio |

#### V2 — AI-Enhanced Layer (Weeks 9–16)

| Feature | Description |
|---|---|
| AI virality scoring | GPT-4 scores + explains idea virality on save |
| AI weekly content planner | Suggests this week's lineup from backlog gaps |
| AI weekly performance report | Natural-language insight summary from metrics |
| Semantic duplicate detection | Vector search flags near-duplicate ideas on capture |
| Evergreen content scorer | Rates content longevity; surfaces repurposing candidates |
| SEO title + description generator | Platform-aware SEO copy on demand |
| Embedding pipeline (background job) | Auto-embeds all new content via API route + cron |
| Custom instruction profiles | Persona-based system prompts for all AI operations |

---

### 3.2 File & Folder Structure

```
creator-os/
├── src/
│   ├── app/
│   │   ├── (app)/                          # Main app layout group
│   │   │   ├── layout.tsx                  # App shell: sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── ideas/
│   │   │   │   ├── page.tsx                # Idea Bank list
│   │   │   │   ├── new/page.tsx            # Quick-capture form
│   │   │   │   └── [id]/page.tsx           # Idea detail
│   │   │   ├── scripts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Script editor
│   │   │   │   │   └── hooks/page.tsx      # Hook Lab
│   │   │   ├── pipeline/
│   │   │   │   ├── page.tsx                # Kanban board
│   │   │   │   └── calendar/page.tsx       # Publishing calendar
│   │   │   ├── library/
│   │   │   │   ├── page.tsx                # Content Library
│   │   │   │   ├── [id]/page.tsx           # Episode detail
│   │   │   │   └── series/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx                # Dashboard overview
│   │   │   │   └── [episodeId]/page.tsx    # Per-episode metrics
│   │   │   └── ai-toolkit/
│   │   │       ├── page.tsx                # Prompt library
│   │   │       ├── runner/page.tsx          # Prompt runner
│   │   │       └── usage/page.tsx           # AI cost log
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── ideas/
│   │       │   ├── route.ts                # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts            # GET, PUT, DELETE
│   │       │       └── embed/route.ts      # POST trigger embedding
│   │       ├── scripts/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── generate/route.ts   # POST AI generation
│   │       │       ├── hooks/route.ts      # POST Hook Lab
│   │       │       └── calibrate/route.ts  # POST audience rewrite
│   │       ├── episodes/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── repurpose/route.ts  # POST repurposing engine
│   │       │       └── seo/route.ts        # POST SEO gen
│   │       ├── analytics/
│   │       │   ├── route.ts                # GET aggregated stats
│   │       │   └── [episodeId]/route.ts    # GET/POST snapshots
│   │       ├── ai/
│   │       │   ├── virality/route.ts       # POST score idea
│   │       │   ├── planner/route.ts        # POST weekly plan
│   │       │   ├── insight-report/route.ts # POST weekly report
│   │       │   └── search/route.ts         # POST semantic search
│   │       ├── tags/route.ts
│   │       └── series/route.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts               # Singleton Mongoose connection
│   │   │   ├── models/
│   │   │   │   ├── ContentIdea.ts
│   │   │   │   ├── Script.ts
│   │   │   │   ├── Episode.ts
│   │   │   │   ├── Series.ts
│   │   │   │   ├── PublishingRecord.ts
│   │   │   │   ├── AnalyticsSnapshot.ts
│   │   │   │   ├── Tag.ts
│   │   │   │   └── AiUsageLog.ts
│   │   │   └── schemas.ts                  # Zod validation schemas
│   │   ├── ai/
│   │   │   ├── openai-client.ts            # Singleton OpenAI client
│   │   │   ├── usage-logger.ts             # Fire-and-forget cost logger
│   │   │   ├── script-generator.ts         # Outline → full script
│   │   │   ├── hook-generator.ts           # Hook Lab (parallel)
│   │   │   ├── audience-calibrator.ts      # Persona rewriter
│   │   │   ├── virality-scorer.ts          # Idea virality score
│   │   │   ├── repurposing-engine.ts       # Long → short clip concepts
│   │   │   ├── seo-generator.ts            # SEO title + description
│   │   │   └── insight-reporter.ts         # Weekly performance digest
│   │   ├── rag/
│   │   │   ├── embeddings.ts               # Voyage AI embeddings
│   │   │   └── retrieval.ts                # $vectorSearch pipeline
│   │   └── auth.ts                         # NextAuth v5 config
│   ├── components/
│   │   ├── shared-ui/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatusChip.tsx
│   │   │   ├── AudienceChip.tsx
│   │   │   ├── PlatformChip.tsx
│   │   │   └── AiLoadingOverlay.tsx
│   │   ├── ideas/
│   │   │   ├── IdeaCaptureForm.tsx
│   │   │   ├── IdeaCard.tsx
│   │   │   └── IdeaStatusPipeline.tsx
│   │   ├── scripts/
│   │   │   ├── ScriptEditor.tsx
│   │   │   ├── ScriptSection.tsx
│   │   │   ├── HookLab.tsx
│   │   │   └── AudienceToggle.tsx
│   │   ├── pipeline/
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── ContentCalendar.tsx
│   │   ├── library/
│   │   │   ├── EpisodeCard.tsx
│   │   │   └── SemanticSearchBar.tsx
│   │   └── analytics/
│   │       ├── MetricsEntryForm.tsx
│   │       ├── TopicHeatmap.tsx
│   │       └── PlatformComparisonChart.tsx
│   ├── styles/
│   │   └── theme.ts                        # MUI v7 MongoDB brand theme
│   ├── types/
│   │   └── index.ts
│   └── contexts/
│       └── AppContext.tsx
├── middleware.ts                            # NextAuth route protection
├── .env.local
└── next.config.ts
```

---

### 3.3 API Route Blueprint

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/ideas` | GET | ✓ | List ideas with filters (status, audience, platform, tag) |
| `/api/ideas` | POST | ✓ | Create new idea; triggers background virality score |
| `/api/ideas/[id]` | GET | ✓ | Get single idea with populated tags |
| `/api/ideas/[id]` | PUT | ✓ | Update idea (status, metadata, etc.) |
| `/api/ideas/[id]` | DELETE | ✓ | Soft-delete (set status: archived) |
| `/api/ideas/[id]/embed` | POST | ✓ | Generate and store Voyage embedding |
| `/api/scripts` | GET | ✓ | List scripts with filters |
| `/api/scripts` | POST | ✓ | Create blank script from ideaId |
| `/api/scripts/[id]` | GET | ✓ | Get script with version history |
| `/api/scripts/[id]` | PUT | ✓ | Save script content + auto-version |
| `/api/scripts/[id]/generate` | POST | ✓ | AI: generate full script from outline |
| `/api/scripts/[id]/hooks` | POST | ✓ | AI: Hook Lab — 5 YT + 5 TT hooks |
| `/api/scripts/[id]/calibrate` | POST | ✓ | AI: rewrite script for audience level |
| `/api/episodes` | GET | ✓ | List episodes (library) with filters |
| `/api/episodes` | POST | ✓ | Create episode from script/idea |
| `/api/episodes/[id]` | GET | ✓ | Get episode detail + publishing records |
| `/api/episodes/[id]` | PUT | ✓ | Update episode metadata |
| `/api/episodes/[id]/repurpose` | POST | ✓ | AI: generate short-form clip concepts |
| `/api/episodes/[id]/seo` | POST | ✓ | AI: generate SEO title + description |
| `/api/analytics` | GET | ✓ | Aggregated analytics (heatmap, rollups) |
| `/api/analytics/[episodeId]` | GET | ✓ | Get snapshots for one episode |
| `/api/analytics/[episodeId]` | POST | ✓ | Log new metrics snapshot |
| `/api/ai/virality` | POST | ✓ | Score an idea's virality (0–100) |
| `/api/ai/planner` | POST | ✓ | Generate weekly content plan from backlog |
| `/api/ai/insight-report` | POST | ✓ | Generate weekly performance digest |
| `/api/ai/search` | POST | ✓ | Semantic search across content via Vector Search |
| `/api/tags` | GET | ✓ | List all tags by category |
| `/api/tags` | POST | ✓ | Create new tag |
| `/api/series` | GET | ✓ | List all series |
| `/api/series` | POST | ✓ | Create new series |
| `/api/series/[id]` | GET | ✓ | Series detail with episodes |

---

## Phase 4 — AI Prompt Library

All prompts use `{{variable}}` syntax matching the platform's Prompt Runner variable slots.

---

### Prompt 1: Generate Video Ideas from Topic Seed

**Use in:** Idea Bank → "Generate Ideas" button  
**Variables:** `{{topic}}`, `{{audience}}`, `{{platform}}`

```
You are a developer advocate content strategist specializing in AI and software development education.

Generate 8 compelling video ideas on the topic: "{{topic}}"

Target audience: {{audience}} (beginner = someone learning AI/dev concepts for the first time; advanced = working software engineer or ML practitioner)
Primary platform: {{platform}}

For each idea, return a JSON array with this structure:
{
  "title": "specific, curiosity-driven working title",
  "hook": "one sentence that opens the video and immediately earns attention",
  "angle": "what makes THIS take on the topic unique vs generic tutorials",
  "format": "tutorial | opinion | demo | explainer | reaction | build-along",
  "estimatedDuration": "YouTube minutes OR TikTok seconds",
  "viralityScore": 0-100,
  "viralityReason": "one sentence",
  "audience": "beginner | advanced | both",
  "topicCluster": "the broader topic family this belongs to"
}

Prioritize ideas that: (1) solve a specific pain point, (2) have a strong visual/demo component, (3) connect to trending AI/developer topics, (4) fit the authentic builder narrative.

Return only the JSON array, no preamble.
```

---

### Prompt 2: Expand Rough Idea into Full Script Outline

**Use in:** Script Studio → "Generate Outline"  
**Variables:** `{{title}}`, `{{audience}}`, `{{platform}}`, `{{keyPoints}}`

```
You are a senior developer advocate who writes scripts for technical video content.

Create a detailed script outline for: "{{title}}"
Platform: {{platform}} | Audience: {{audience}}

Key points to cover: {{keyPoints}}

Structure the outline with these sections, each with:
- A specific sub-heading for the section
- 3–5 bullet points of exactly what to say/show
- A transition note to the next section

Sections required:
1. HOOK (first 15 seconds — make them stay)
2. PROBLEM (what pain does this solve? why should they care?)
3. CONTEXT (brief background — calibrated for {{audience}})
4. SOLUTION/WALKTHROUGH (the main content — step by step)
5. DEMO (what to show on screen, what to type, what output to highlight)
6. GOTCHAS (1–2 things that trip people up — builds trust)
7. CTA (specific next step — subscribe, repo link, next video)

Return as a structured JSON object with section names as keys and { heading, bullets[], transition } as values.
```

---

### Prompt 3: YouTube Hook Generator

**Use in:** Hook Lab (YouTube panel)  
**Variables:** `{{title}}`, `{{problem}}`, `{{audience}}`

```
You are a YouTube content strategist who has studied thousands of high-retention developer tutorial openings.

Generate 5 distinct YouTube hooks for a video titled: "{{title}}"
Core problem it solves: {{problem}}
Audience: {{audience}}

Each hook must be spoken in the first 15 seconds and must do ONE of these things:
- Make a bold, specific claim that challenges a common belief
- Ask a question the viewer is actively asking themselves
- Reveal a surprising fact or counterintuitive truth
- Start mid-action (in the middle of something visual)
- State a relatable frustration with precise specificity

Rules:
- Maximum 60 words each
- No "In this video..." or "Today we're going to..."
- No generic phrases like "Have you ever wondered..."
- Must feel natural when spoken, not read
- Must establish the creator as someone who has DONE this, not just studied it

Return a JSON array: [{ "hook": "...", "technique": "claim|question|fact|action|frustration", "whyItWorks": "one sentence" }]
```

---

### Prompt 4: TikTok Hook Generator

**Use in:** Hook Lab (TikTok panel)  
**Variables:** `{{title}}`, `{{problem}}`, `{{audience}}`

```
You are a TikTok content strategist specializing in developer and AI education content.

Generate 5 TikTok hooks for a video about: "{{title}}"
Core insight: {{problem}}
Audience: {{audience}}

TikTok hooks must:
- Be spoken in the FIRST 3 SECONDS (max 15 words)
- Trigger an immediate pattern interrupt — something unexpected
- Create a "wait, what?" reaction that physically stops scrolling
- Work as both spoken words AND on-screen text simultaneously
- Be conversational, punchy, slightly provocative

Formats that work well for dev/AI content:
- "Nobody talks about [specific thing] when building [X]"
- "I wasted [X] hours so you don't have to"
- "Your [tech] is slow because of THIS"
- "The [X] that [senior devs / big companies] actually use"
- "Stop building [X] the wrong way"

Return a JSON array: [{ "hook": "...", "onScreenText": "condensed version for overlay", "scrollStopReason": "why this works" }]
```

---

### Prompt 5: Repurpose Long-Form Script into Short-Form Clips

**Use in:** Content Library → Episode → "Repurpose"  
**Variables:** `{{script}}`, `{{title}}`, `{{platform}}`

```
You are a content repurposing specialist for developer education channels.

Original YouTube script for "{{title}}":
---
{{script}}
---

Target platform for clips: {{platform}}

Identify 4–6 self-contained moments in this script that work as standalone short-form content. For each clip:

1. Find a section that contains ONE complete idea with a clear payoff
2. Confirm it works WITHOUT requiring the viewer to have seen the full video
3. Rewrite the opening 3 seconds as a standalone hook (no "as I mentioned...")
4. Trim any unnecessary context — short-form viewers have zero patience

Return a JSON array:
{
  "clipNumber": 1,
  "conceptTitle": "short title for this clip",
  "originalSection": "quote the first 10 words of the source section",
  "estimatedDuration": "seconds",
  "newHook": "rewritten 3-second opener",
  "script": "full rewritten short-form script (conversational, punchy)",
  "onScreenTextSuggestions": ["text overlay 1", "text overlay 2"],
  "whyItStandsAlone": "one sentence"
}
```

---

### Prompt 6: SEO-Optimized YouTube Title & Description

**Use in:** Publishing Pipeline → Episode → "Generate SEO"  
**Variables:** `{{title}}`, `{{script}}`, `{{tags}}`

```
You are a YouTube SEO specialist for developer and AI education content.

Video working title: {{title}}
Key topics covered: {{tags}}
Script summary or first 500 words: {{script}}

Generate:

1. TITLE OPTIONS (5 variations):
   - One keyword-first title (leads with the main search term)
   - One curiosity-gap title (creates urgency to click)
   - One specific/numerical title ("Build X in Y minutes")
   - One pain-point title ("Stop doing X. Do this instead")
   - One authority title ("The [X] approach that actually works")
   Each must be under 70 characters. Mark the recommended one.

2. DESCRIPTION:
   - First 2 lines (visible before "Show more"): benefit-forward, includes primary keyword, NO clickbait
   - Full description (300–500 words): natural keyword integration, covers what's in the video
   - Timestamps placeholder: [ADD TIMESTAMPS]
   - Links section: [ADD REPO LINK], [ADD RELATED VIDEOS]
   - Tags list: 15–20 YouTube tags, mix of broad and specific

Return as JSON: { "titles": [...], "recommendedTitle": "...", "description": "...", "tags": [...] }
```

---

### Prompt 7: Audience Calibration — Beginner Rewrite

**Use in:** Script Studio → Audience Toggle → Beginner  
**Variables:** `{{script}}`

```
You are rewriting a developer education script for a beginner audience.

Definition of this audience: Someone curious about AI and software development but not yet a working engineer. They understand that code exists and have maybe tried a tutorial, but jargon, acronyms, and assumed context lose them immediately.

Original script:
---
{{script}}
---

Rewrite rules:
1. Every technical term gets a plain-English definition the FIRST time it appears
2. Replace all acronyms with their full name + a one-clause explanation on first use
3. Add analogies for abstract concepts — use cooking, sports, or everyday objects
4. Slow down the demo sections — narrate what you're doing AND why, not just what
5. Add explicit "why should I care" moments at each major section transition
6. Remove assumed context ("as you probably know...", "obviously...", "just...")
7. Keep the energy high — beginners don't want to feel talked down to, just included

Preserve the structure, all technical accuracy, and the creator's voice. Do NOT oversimplify to the point of being wrong. Return the full rewritten script.
```

---

### Prompt 8: Audience Calibration — Advanced Developer Rewrite

**Use in:** Script Studio → Audience Toggle → Advanced  
**Variables:** `{{script}}`

```
You are rewriting a developer education script for an experienced software engineer audience.

Definition of this audience: Working software engineers or ML practitioners, 3+ years experience. They're familiar with core CS concepts, REST APIs, databases, and have likely used at least one LLM API. They lose patience quickly with over-explanation and surface-level content.

Original script:
---
{{script}}
---

Rewrite rules:
1. Cut all definition sentences for standard industry terms (they know what an API is)
2. Lead with the non-obvious insight — the thing they DON'T already know
3. Add depth where the original is shallow: tradeoffs, edge cases, performance implications, production considerations
4. Replace generic analogies with code-level specifics wherever possible
5. Add "what I tried first and why it failed" beats — experienced devs respect the scar tissue
6. Speed up the basics, slow down the novel parts
7. Reference complementary tools, patterns, or approaches they might compare this to

Preserve all core content and the creator's authentic voice. Return the full rewritten script.
```

---

### Prompt 9: Weekly Content Planner

**Use in:** Publishing Pipeline → "Plan This Week"  
**Variables:** `{{ideas}}`, `{{publishedRecently}}`, `{{weekOf}}`

```
You are a content calendar strategist for a developer advocate creating AI & software development content.

Publishing targets: 3 YouTube videos/week + 5 TikToks/week
Week of: {{weekOf}}

Available ideas in backlog (title | audience | platform | virality score):
{{ideas}}

Recently published (avoid repetition):
{{publishedRecently}}

Create an optimal week plan:

Rules:
1. Vary audience targeting — don't schedule 3 advanced YouTube videos in a row
2. TikToks should include at least 2 clips derived from this week's YouTube content
3. Balance topic clusters — no more than 2 videos on the same topic in one week
4. Lead the week with the highest virality score YouTube video (Monday/Tuesday)
5. Save opinion/reaction formats for later in the week
6. Flag if the backlog is thin on any platform or audience type

Return JSON:
{
  "weekOf": "...",
  "youtube": [{ "day": "Monday", "ideaId": "...", "title": "...", "rationale": "..." }, ...],
  "tiktok": [{ "day": "...", "ideaId": "...", "title": "...", "derivedFrom": "YouTube title or null" }, ...],
  "warnings": ["backlog thin on beginner content", ...],
  "suggestedNewIdeas": ["gap I noticed in the plan — consider creating: ..."]
}
```

---

### Prompt 10: Weekly Performance Insight Report

**Use in:** Analytics Dashboard → "Generate Weekly Report"  
**Variables:** `{{metricsData}}`, `{{weekOf}}`, `{{previousWeekData}}`

```
You are a content analytics advisor for a developer education creator on YouTube and TikTok.

Week of: {{weekOf}}

This week's performance data:
{{metricsData}}

Previous week for comparison:
{{previousWeekData}}

Generate a weekly performance report that a solo creator can act on in 5 minutes:

1. HEADLINE METRIC: One sentence. The single most important number from this week.

2. WINS (2–3): What worked. Be specific — name the video, cite the metric, explain WHY it likely worked.

3. UNDERPERFORMERS (1–2): What didn't land. Be direct. Suggest one change for next time.

4. PATTERNS: What does this week's data reveal about your audience? Topics, formats, publish times?

5. NEXT WEEK RECOMMENDATIONS (3 specific actions):
   - One content topic or angle to double down on
   - One format or structure change to test
   - One operational change (publish time, thumbnail style, hook length, etc.)

6. MOMENTUM SCORE: 1–10 rating of overall channel trajectory this week with one-line justification.

Write in a direct, collegial tone — not corporate, not cheerleading. Be honest about what isn't working.
Return as structured JSON with keys: headline, wins, underperformers, patterns, recommendations, momentumScore.
```

---

## Environment Variables

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
VOYAGE_API_KEY=pa-...
```

## Key Dependencies

```bash
npm install mongoose next-auth@beta openai @mui/material @mui/icons-material \
  @emotion/react @emotion/styled zod
```

---

*Creator OS · Built with MongoDB Atlas, Next.js 14, MUI v7 · © 2026*
