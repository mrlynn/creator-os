# Sprint 7: Custom Instruction Profiles, Hybrid Search, RAG

**Phase:** sprint7  
**Source:** `.planning/phases/sprint7/RESEARCH.md`  
**Implementation order:** 1 → 2 → 3 (Track A); 4 → 5 (Track B, requires Sprint 5 complete)

**GSD plan files (for execute-phase):**
- `sprint7-01-PLAN.md` — InstructionProfile model, CRUD API, getProfileInstruction helper
- `sprint7-02-PLAN.md` — Integrate profile into 10 AI ops
- `sprint7-03-PLAN.md` — AI Toolkit profiles section, InstructionProfileSelector component
- `sprint7-04-PLAN.md` — Hybrid search API (Sprint 5 dep)
- `sprint7-05-PLAN.md` — RAG getRagContext + injection (Sprint 5 dep)

---

## Overview

| # | Feature | Plans | Key Files |
|---|---------|-------|-----------|
| 1 | Custom instruction profiles | 01, 02, 03 | InstructionProfile model, /api/instruction-profiles, instruction-profile.ts, 10 AI ops, ai-toolkit page |
| 2 | Hybrid search | 04 | /api/ai/search (mode=hybrid) |
| 3 | RAG for AI Toolkit | 05 | rag-retrieval.ts, script-gen, hook-gen, repurpose, SEO, prompt-run |

---

## Sprint 5 Status (as of 2026-03-18)

| Component | Status |
|-----------|--------|
| embeddings.ts | ✅ Exists |
| embedding field on models | ❌ Missing |
| Embed routes, embed-pipeline | ❌ Missing |
| POST /api/ai/search | ❌ Missing |

**Implication:** Track A (custom instruction profiles) ships independently. Track B (hybrid search, RAG) requires Sprint 5 completion first.

---

## Feature → Plan Mapping

| Requirement | Description | Plan |
|-------------|-------------|------|
| PROFILE-01 | InstructionProfile model | 01 |
| PROFILE-02 | CRUD API /api/instruction-profiles | 01 |
| PROFILE-03 | getProfileInstruction(profileId) helper | 01 |
| PROFILE-04 | Integrate profile into 10 AI ops | 02 |
| PROFILE-05 | AI Toolkit UI: profiles section, create/edit/delete, default | 03 |
| PROFILE-06 | InstructionProfileSelector component | 03 |
| HYBRID-01 | Hybrid search API (vector + text) | 04 |
| RAG-01 | getRagContext helper | 05 |
| RAG-02 | RAG injection into script-gen, hook-gen, prompt-run | 05 |

---

## Wave Structure

### Track A (No Sprint 5 Dependency)

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 01 | — |
| 2 | 02, 03 | 01 |

- **Plan 01:** Model + API + helper — foundation for profiles
- **Plan 02:** AI op integration — requires getProfileInstruction from 01
- **Plan 03:** UI — requires API from 01; no file overlap with 02 → both Wave 2

### Track B (Sprint 5 Follow-On)

| Wave | Plans | Depends On |
|------|-------|------------|
| 1 | 04, 05 | sprint5-05 |

- **Plan 04:** Hybrid search — extends /api/ai/search
- **Plan 05:** RAG — getRagContext + injection; both depend only on sprint5-05

---

## Implementation Order (Incremental Commits)

1. **Plan 01** — InstructionProfile model, CRUD API, helper  
   - Commit: `feat(sprint7): add InstructionProfile model, CRUD API, getProfileInstruction`

2. **Plan 02** — AI op integration  
   - Commit: `feat(sprint7): integrate instruction profiles into 10 AI ops`

3. **Plan 03** — AI Toolkit UI  
   - Commit: `feat(sprint7): add Instruction Profiles section and selector to AI Toolkit`

4. **Plan 04** — Hybrid search (Sprint 5 required)  
   - Commit: `feat(sprint7): add hybrid search mode to /api/ai/search`

5. **Plan 05** — RAG (Sprint 5 required)  
   - Commit: `feat(sprint7): add RAG context retrieval for script-gen, hook-gen, repurpose, SEO, prompt-run`

---

## Key Interfaces (for executor reference)

### Profile integration pattern (ops with system prompt)
```javascript
const profilePrefix = profileId ? await getProfileInstruction(profileId) : '';
const systemPrompt = profilePrefix
  ? `${profilePrefix}\n\n${baseSystemPrompt}`
  : baseSystemPrompt;
```

### Profile integration pattern (ops with user-only: hook-gen, prompt-run)
```javascript
const messages = profileId
  ? [
      { role: 'system', content: await getProfileInstruction(profileId) },
      { role: 'user', content: userContent },
    ]
  : [{ role: 'user', content: userContent }];
```

### Applicable operations (match AiUsageLog categories)
script-generation, hook-generation, virality-scoring, repurposing, seo-generation, evergreen-scoring, planner, insight-report, tagging, prompt-run

### Existing patterns
- connectToDatabase(), getServerSession()
- logAiUsage({ category, tokensUsed, durationMs, success })
- Tags/Series CRUD pattern for /api/instruction-profiles

---

## Verification Summary

| Plan | Automated | Manual |
|------|-----------|--------|
| 01 | npm run build, API curl | CRUD works; getProfileInstruction returns text |
| 02 | npm run build | POST with profileId → output reflects profile |
| 03 | npm run build | AI Toolkit: list, create, edit, delete, default |
| 04 | npm run build, API curl | mode=hybrid returns vector + text matches |
| 05 | npm run build | includeRag=true → context includes past content |
