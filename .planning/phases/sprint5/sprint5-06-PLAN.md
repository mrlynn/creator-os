---
phase: sprint5
plan: 06
type: execute
wave: 3
depends_on:
  - sprint5-05
files_modified:
  - src/components/library/SemanticSearchBar.tsx
  - src/app/app/library/page.tsx
autonomous: true
requirements:
  - VEC-06
must_haves:
  truths:
    - User can type query in SemanticSearchBar and see semantic search results
    - Results grouped by Ideas, Episodes, Scripts; each item links to detail page
  artifacts:
    - path: src/components/library/SemanticSearchBar.tsx
      provides: Search input, results display
    - path: src/app/app/library/page.tsx
      provides: SemanticSearchBar integration
  key_links:
    - from: SemanticSearchBar.tsx
      to: /api/ai/search
      via: fetch POST
    - from: library/page.tsx
      to: SemanticSearchBar
      via: import and render
---

<objective>
SemanticSearchBar on Library page: TextField with debounce, POST /api/ai/search, display results grouped by type with links.
Purpose: PRD component; enable semantic search from Content Library.
Output: SemanticSearchBar.tsx, integration in library/page.tsx.
</objective>

<context>
@.planning/phases/sprint5/RESEARCH.md
@src/app/app/library/page.tsx
@src/app/app/library/[id]/page.tsx
@src/app/app/ideas/[id]/page.tsx
@src/app/app/scripts/[id]/page.tsx
</context>

<interfaces>
API response: { ideas: Array&lt;{_id, title, description?, score}&gt;, episodes: Array&lt;{_id, title, description?, score}&gt;, scripts: Array&lt;{_id, title, ...}&gt; }
Detail links: /app/ideas/{id}, /app/library/{id}, /app/scripts/{id}
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: SemanticSearchBar component</name>
  <files>src/components/library/SemanticSearchBar.tsx</files>
  <action>
Create SemanticSearchBar.tsx (client component). Add 'use client' at top.
1. TextField with SearchIcon, placeholder "Search by meaning..."
2. Debounce input 300ms (useState + useEffect or useDebouncedCallback)
3. On submit/debounced search: POST /api/ai/search with { query: value }
4. Loading state during request
5. Display results in three sections: Ideas, Episodes, Scripts
6. Each item: title, optional description (truncated), link to detail page
   - Ideas: Link to /app/ideas/{id}
   - Episodes: Link to /app/library/{id}
   - Scripts: Link to /app/scripts/{id}
7. Empty state: "No results" when all arrays empty
8. Use MUI Box, Paper, Typography, Link; reuse EpisodeCard-style for episode results if available, else simple list
9. Handle error state (show error message)
</action>
  <verify>Component renders; typing triggers search; results display with links</verify>
  <done>SemanticSearchBar fetches and displays semantic search results</done>
</task>

<task type="auto">
  <name>Task 2: Integrate SemanticSearchBar on Library page</name>
  <files>src/app/app/library/page.tsx</files>
  <action>
1. Import SemanticSearchBar from '@/components/library/SemanticSearchBar'
2. Add SemanticSearchBar above or beside existing filters (Stack with FormControls)
3. Place above the filter row or as first item in the filter Stack
4. Ensure layout works on mobile (Stack direction column on xs)
</action>
  <verify>Visit /app/library, see SemanticSearchBar, search returns results</verify>
  <done>Library page has SemanticSearchBar; search works</done>
</task>

</tasks>

<verification>
- npm run build passes
- Library page shows SemanticSearchBar
- Search returns results; links navigate to detail pages
</verification>

<success_criteria>
- SemanticSearchBar debounced 300ms
- Results grouped by Ideas, Episodes, Scripts
- Each result links to correct detail page
</success_criteria>
