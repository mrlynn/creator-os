# Creator OS — Implementation Roadmap

**Last updated:** 2026-03-18

## Vision

> "I captured an idea on my phone, turned it into a script with AI, generated hooks, turned one video into five TikToks, scheduled everything, and saw which topics performed best—all in one place."

## Completed Sprints

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| 4 | Content Library, AI Toolkit | Repurposing engine, Prompt library, Auto-tagging, Topic heatmap |
| 5 | Embeddings & Search | Voyage embeddings, Embed routes, Semantic search, SemanticSearchBar |
| 6 | AI-Enhanced Layer | SEO generator, Evergreen scorer, Weekly planner, Insight report |
| 7 | Profiles & RAG | InstructionProfile, Hybrid search, RAG injection |

## Current Sprint: 8 — Creator Love (Complete)

| Plan | Feature | Status |
|------|---------|--------|
| 01 | Repurpose UX (Clip→Episode, timestamps, batch export) | ✅ Done |
| 02 | Calendar improvements (nav to episode, gap detection) | ✅ Done |
| 03 | Loading skeletons | ✅ Done |
| 04 | Keyboard shortcuts | ✅ Done |
| 05 | Voice-to-text capture | ✅ Done |

## Future Sprints

### Sprint 9: Publishing Integrations

**Phase 1 (MVP):** Metadata export — zero API dependency

| Plan | Feature | Status |
|------|---------|--------|
| 01 | Metadata export (Library — Copy for YouTube, TikTok, JSON) | ✅ Done (cd357a6) |
| 02 | Metadata export (Pipeline card quick copy) | ✅ Done (c1bf105) |

**Phase 2:** OAuth + upload (ready)

| Plan | Feature | Status |
|------|---------|--------|
| 03 | PlatformConnection model | Ready |
| 04 | YouTube OAuth + Settings page | Ready |
| 05 | TikTok OAuth connect | Ready |
| 06 | Upload flow (private-only) | Ready |

**Plans:** 6 plans. Phase 1 done; Phase 2 execute 03 → 04 → 05 → 06 (sequential).

### Sprint 10: Extended Capture

- **Browser extension** — Capture from Twitter, HN, docs
- **Slack/Discord bot** — `/idea [title]` to Idea Bank
- **PWA** — Mobile install, offline capture

### Sprint 11: Analytics & Insights

- **Platform API pulls** — YouTube Analytics, TikTok (where available)
- **Topic performance** — Heatmap polish, trend charts
- **"What to make next"** — Weekly suggestions from idea bank + performance

### Sprint 12: Settings & AI Configuration

**Roadmap:** `.planning/SETTINGS-ROADMAP.md`

- **Phase 1:** Config foundation (AppConfig model, API, env-only keys)
- **Phase 2:** LLM provider abstraction (multi-provider, model selection)
- **Phase 3:** Embeddings, RAG & tunables (all config-driven)
- **Phase 4:** Settings page UI (LLM, embeddings, RAG, tunables sections)

## Priority Matrix

| Impact | Effort | Feature |
|--------|--------|---------|
| High | Low | Repurpose UX, Loading skeletons, Keyboard shortcuts |
| High | Medium | Voice capture, Calendar improvements |
| Very High | High | Publishing integrations |
| Medium | Medium | Extended capture, Analytics API pulls |
