---
phase: sprint8
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/pipeline/CalendarView.tsx
  - src/app/app/pipeline/page.tsx
autonomous: true
requirements:
  - CAL-01
  - CAL-02
---

<objective>
Calendar improvements: Event click navigates to episode detail; optional gap detection.
Purpose: Make calendar actionable — click event to see episode; surface cadence gaps.
</objective>

<context>
- CalendarView uses FullCalendar, fetchEvents from /api/calendar
- handleEventClick currently: router.push('/app/pipeline')
- CalendarEvent has extendedProps: { episodeId, platform }
- Pipeline has "Plan This Week" with planData.warnings
</context>

<tasks>

<task type="auto">
  <name>Task 1: Event click to episode</name>
  <files>src/components/pipeline/CalendarView.tsx</files>
  <action>
1. Update handleEventClick to use event.extendedProps.episodeId
2. Navigate to /app/library/[episodeId] instead of /app/pipeline
3. Pass info (FullCalendar event info) to handler; info.event.extendedProps.episodeId
  </action>
  <verify>Clicking calendar event opens library episode detail</verify>
</task>

<task type="auto">
  <name>Task 2: Gap detection banner</name>
  <files>src/app/app/pipeline/page.tsx, src/app/api/ai/planner/route.ts</files>
  <action>
1. Planner API already returns warnings (e.g. "No TikTok this week")
2. When Calendar tab is active, optionally fetch planner and show warnings banner above calendar
3. Or: add "Check cadence" button that runs planner and shows warnings in a small Alert
4. Simpler: if planDialogOpen or planData exists, show warnings. Or add a lightweight GET /api/ai/planner/check that returns just warnings for current week without full plan. Reuse existing POST /api/ai/planner — when user clicks "Plan This Week" they get warnings. For automatic: on Calendar tab mount, optionally call planner check. Keep it simple: add a "Check cadence" button near calendar that calls planner, shows warnings in Alert if any.
  </action>
  <verify>Gap detection surfaces when user checks cadence</verify>
</task>

</tasks>

<verification>
- Calendar event click → /app/library/[episodeId]
- "Check cadence" or similar shows planner warnings
</verification>
