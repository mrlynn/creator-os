---
phase: sprint5
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/runbook/ATLAS_VECTOR_INDEXES.md
autonomous: true
requirements:
  - VEC-03
must_haves:
  truths:
    - Runbook documents how to create Atlas vector indexes
    - Index definitions match schema (1024 dims, cosine similarity)
  artifacts:
    - path: docs/runbook/ATLAS_VECTOR_INDEXES.md
      provides: Index JSON for contentideas, episodes, scripts
  key_links:
    - from: runbook
      to: Atlas UI
      via: Manual creation steps
---

<objective>
Atlas Vector Search indexes: document index definitions for manual creation in Atlas UI.
Purpose: Enable $vectorSearch; indexes must exist before semantic search works.
Output: docs/runbook/ATLAS_VECTOR_INDEXES.md with index JSON and creation steps.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Atlas vector index runbook</name>
  <files>docs/runbook/ATLAS_VECTOR_INDEXES.md</files>
  <action>
Create docs/runbook/ATLAS_VECTOR_INDEXES.md with:

1. Prerequisites: MongoDB Atlas M10+, MongoDB v6.0.11+ or v7.0.2+, VOYAGE_API_KEY
2. Index creation steps: Database → Collections → [collection] → Search Indexes → Create Index
3. Three index definitions (JSON):

**contentideas** — index name: content_vector_index
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" },
    { "type": "filter", "path": "platform" },
    { "type": "filter", "path": "audience" }
  ]
}

**episodes** — index name: episode_vector_index
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "publishingStatus" },
    { "type": "filter", "path": "editingStatus" }
  ]
}

**scripts** — index name: script_vector_index
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024, "similarity": "cosine" },
    { "type": "filter", "path": "status" }
  ]
}

4. Note: Indexes can take minutes to build; documents need embedding populated via embed API
5. Note: VOYAGE_API_KEY required (already in .env.example)
  </action>
  <verify>File exists; JSON is valid</verify>
  <done>Runbook enables manual index creation in Atlas UI</done>
</task>

</tasks>

<verification>
- docs/runbook/ATLAS_VECTOR_INDEXES.md exists with valid index definitions
</verification>

<success_criteria>
- Runbook documents all three indexes
- User can create indexes in Atlas UI following runbook
</success_criteria>
