---
phase: sprint8
plan: 03
type: execute
wave: 2
depends_on: []
files_modified:
  - src/app/app/ideas/page.tsx
  - src/app/app/scripts/page.tsx
  - src/app/app/pipeline/page.tsx
  - src/app/app/library/page.tsx
  - src/components/shared-ui/ListSkeleton.tsx (new)
autonomous: true
requirements:
  - SKELETON-01
  - SKELETON-02
  - SKELETON-03
  - SKELETON-04
---

<objective>
Loading skeletons for Ideas, Scripts, Pipeline, Library list views.
Purpose: Avoid blank screens during fetch; improve perceived performance.
</objective>

<context>
- Ideas page: list of idea cards, loading state shows CircularProgress
- Scripts page: list of script cards
- Pipeline page: Kanban columns with episode cards
- Library page: list of episode cards
- MUI has Skeleton component
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create ListSkeleton component</name>
  <files>src/components/shared-ui/ListSkeleton.tsx</files>
  <action>
1. Create reusable ListSkeleton: accepts count (default 5), variant (card/row)
2. Card variant: Skeleton with height ~80-100px, rounded, 3-5 placeholders in Stack
3. Row variant: Skeleton rows for table-like layout
4. Use MUI Skeleton, sx for spacing
  </action>
  <verify>ListSkeleton renders without error</verify>
</task>

<task type="auto">
  <name>Task 2: Ideas page skeleton</name>
  <files>src/app/app/ideas/page.tsx</files>
  <action>
1. When loading, show ListSkeleton (card variant, count 6) instead of or alongside CircularProgress
2. Replace full-page spinner with skeleton grid matching idea card layout
  </action>
  <verify>Ideas page shows skeleton while loading</verify>
</task>

<task type="auto">
  <name>Task 3: Scripts page skeleton</name>
  <files>src/app/app/scripts/page.tsx</files>
  <action>
1. When loading, show ListSkeleton (card variant) matching script card layout
  </action>
  <verify>Scripts page shows skeleton while loading</verify>
</task>

<task type="auto">
  <name>Task 4: Pipeline page skeleton</name>
  <files>src/app/app/pipeline/page.tsx</files>
  <action>
1. When loading, show skeleton columns matching Kanban layout (4 columns, 2-3 cards per column)
2. Or use ListSkeleton in each column
  </action>
  <verify>Pipeline shows skeleton while loading</verify>
</task>

<task type="auto">
  <name>Task 5: Library page skeleton</name>
  <files>src/app/app/library/page.tsx</files>
  <action>
1. When loading, show ListSkeleton matching library card layout
  </action>
  <verify>Library shows skeleton while loading</verify>
</task>

</tasks>

<verification>
- All four list views show skeletons during loading
- No blank white screen
</verification>
