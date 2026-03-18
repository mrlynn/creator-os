---
phase: sprint7
plan: 01-02-03
subsystem: ai
tags: [instruction-profiles, mongodb, mongoose, nextjs, openai, material-ui]

# Dependency graph
requires: []
provides:
  - InstructionProfile model and CRUD API
  - getProfileInstruction helper for persona-based system prompts
  - profileId integration in 10 AI operations (script-gen, hook-gen, virality, repurpose, seo, evergreen, planner, insight-report, tagging, prompt-run)
  - AI Toolkit Instruction Profiles section (list, create, edit, delete, default)
  - InstructionProfileSelector reusable component
affects: [sprint7-04, sprint7-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [prepend-profile-to-system-prompt, add-system-message-when-profile-provided]

key-files:
  created:
    - src/lib/db/models/InstructionProfile.ts
    - src/app/api/instruction-profiles/route.ts
    - src/app/api/instruction-profiles/[id]/route.ts
    - src/lib/ai/instruction-profile.ts
    - src/components/ai/InstructionProfileSelector.tsx
  modified:
    - src/lib/db/schemas.ts
    - src/lib/db/models/index.ts
    - src/lib/ai/script-generator.ts
    - src/lib/ai/hook-generator.ts
    - src/lib/ai/virality-scorer.ts
    - src/lib/ai/repurposing-engine.ts
    - src/lib/ai/seo-generator.ts
    - src/lib/ai/evergreen-scorer.ts
    - src/lib/ai/planner.ts
    - src/lib/ai/insight-reporter.ts
    - src/lib/ai/auto-tagger.ts
    - src/app/app/ai-toolkit/page.tsx
    - 10 API routes (generate, hooks, score, repurpose, seo, evergreen, planner, insight-report, episodes, prompt-run)

key-decisions:
  - "Use connectToDatabase() from @/lib/db/connection (not connectDB)"
  - "Ops with system prompt: prepend profile to system; ops with user-only: add system message when profile provided"
  - "profileId optional on all AI ops; no breaking changes when omitted"

patterns-established:
  - "Instruction profile pattern: getProfileInstruction(profileId) returns text or ''; prepend to system or add as system message"
  - "Default-unique: only one profile can be isDefault; API unsets others on create/update"

requirements-completed: [PROFILE-01, PROFILE-02, PROFILE-03, PROFILE-04, PROFILE-05, PROFILE-06]

# Metrics
duration: ~25min
completed: 2026-03-18
---

# Sprint 7 Track A: Custom Instruction Profiles Summary

**InstructionProfile model, CRUD API, getProfileInstruction helper, integration into 10 AI ops, and AI Toolkit profiles section with InstructionProfileSelector component**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3 plans, 8 tasks total
- **Files created:** 5
- **Files modified:** 15+

## Accomplishments

- InstructionProfile model with name, instructionText, applicableOperations, isDefault
- GET/POST /api/instruction-profiles, GET/PUT/DELETE /api/instruction-profiles/[id]
- getProfileInstruction(profileId) helper returns instruction text or empty string
- All 10 AI ops accept optional profileId: script-gen, hook-gen, virality, repurpose, seo, evergreen, planner, insight-report, auto-tagger, prompt-run
- Ops with system prompt: prepend profile; ops with user-only (hook-gen, prompt-run): add system message
- AI Toolkit: Instruction Profiles section with list, create, edit, delete, default badge
- InstructionProfileSelector: reusable dropdown for per-operation profile selection

## Plan Commits

1. **Plan 01:** `8c45899` - feat(sprint7): add InstructionProfile model, CRUD API, getProfileInstruction
2. **Plan 02:** `b695631` - feat(sprint7): integrate instruction profiles into 10 AI ops
3. **Plan 03:** `8e28c37` - feat(sprint7): add Instruction Profiles section and selector to AI Toolkit

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript: findById().lean() return type for instruction-profile.ts required `as` cast for instructionText access (Rule 1 - Bug fix)

## Next Phase Readiness

- Track A complete; InstructionProfileSelector ready for embedding in script generate, hook lab, prompt run UIs
- Track B (plans 04, 05) requires Sprint 5 completion

---
*Phase: sprint7*
*Completed: 2026-03-18*
