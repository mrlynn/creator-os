---
phase: sprint6
plan: 04
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/ai/insight-reporter.ts
  - src/lib/db/models/AiUsageLog.ts
  - src/app/api/ai/insight-report/route.ts
  - src/app/app/analytics/page.tsx
autonomous: true
requirements:
  - REPORT-01
  - REPORT-02
must_haves:
  truths:
    - POST /api/ai/insight-report returns headline, wins, underperformers, patterns, recommendations, momentumScore
    - Analytics page has "Generate Report" button
  artifacts:
    - path: src/lib/ai/insight-reporter.ts
      provides: generateWeeklyReport(metricsData, previousWeekData, weekOf)
    - path: src/app/api/ai/insight-report/route.ts
      provides: POST handler
    - path: src/app/app/analytics/page.tsx
      provides: Generate Report button
  key_links:
    - from: insight-report/route.ts
      to: AnalyticsSnapshot
      via: aggregate by episode, by week
    - from: insight-reporter.ts
      to: usage-logger.ts
      via: logAiUsage({ category: 'insight-report' })
---

<objective>
AI weekly performance report: GPT-4 with PRD Prompt 10; headline, wins, underperformers, patterns, recommendations, momentum score.
Purpose: "1 hr/week" saved; Analytics page natural home.
Output: insight-reporter.ts, POST /api/ai/insight-report, "Generate Report" button on Analytics.
</objective>

<context>
@.planning/phases/sprint6/RESEARCH.md
@src/lib/db/models/AnalyticsSnapshot.ts
@src/lib/db/models/Episode.ts
@src/app/app/analytics/page.tsx
</context>

<interfaces>
PRD Prompt 10 verbatim: headline, wins (2–3), underperformers (1–2), patterns, recommendations (3), momentumScore (1–10)
AnalyticsSnapshot: episodeId, platform, snapshotDate, viewCount, likeCount, commentCount, shareCount, engagement
metricsData format: "Episode X: 1.2K views, 45 likes, 12 comments, 3.2% engagement"
weekOf: YYYY-MM-DD; define "this week" as calendar week (Mon–Sun) or last 7 days; document in API
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add insight-report category and create insight-reporter.ts</name>
  <files>src/lib/db/models/AiUsageLog.ts, src/lib/ai/insight-reporter.ts</files>
  <action>
1. AiUsageLog: add 'insight-report' to category enum
2. Create src/lib/ai/insight-reporter.ts
3. Export async function generateWeeklyReport(params: { metricsData: string; previousWeekData: string; weekOf: string }): Promise&lt;{ success: true; data: { headline: string; wins: string[]; underperformers: string[]; patterns: string[]; recommendations: string[]; momentumScore: number } } | { success: false; error: string }&gt;
4. Use PRD Prompt 10 verbatim:
   - System: "You are a content analytics advisor for developer education creator."
   - User: Week of: {{weekOf}}. This week's performance data: {{metricsData}}. Previous week for comparison: {{previousWeekData}}
   - Generate: HEADLINE METRIC, WINS (2–3), UNDERPERFORMERS (1–2), PATTERNS, NEXT WEEK RECOMMENDATIONS (3), MOMENTUM SCORE (1–10)
   - Return JSON: { headline, wins, underperformers, patterns, recommendations, momentumScore }
5. response_format: { type: 'json_object' }; parse and validate
6. logAiUsage({ category: 'insight-report', tokensUsed, durationMs, success })
  </action>
  <verify>npm run build</verify>
  <done>generateWeeklyReport() returns report structure</done>
</task>

<task type="auto">
  <name>Task 2: Create POST /api/ai/insight-report</name>
  <files>src/app/api/ai/insight-report/route.ts</files>
  <action>
1. Create src/app/api/ai/insight-report/route.ts
2. getServerSession(); return 401 if unauthenticated
3. connectToDatabase()
4. Parse body: { weekOf?: string }; default to current week (Monday YYYY-MM-DD)
5. Define week boundaries: this week = Mon 00:00 to Sun 23:59; previous week = prior Mon–Sun
6. Query AnalyticsSnapshot: snapshotDate in this week; group by episodeId; aggregate viewCount, likeCount, commentCount, shareCount, engagement
7. Populate episodeId to get Episode titles
8. Build metricsData string: "Episode {title}: {viewCount} views, {likeCount} likes, {commentCount} comments, {engagement}% engagement" per episode
9. Query previous week snapshots; build previousWeekData same format
10. If no snapshots: return 400 or 200 with message "Add analytics snapshots to generate reports"
11. Call generateWeeklyReport({ metricsData, previousWeekData, weekOf })
12. Return Response.json(result.data)
  </action>
  <verify>curl -X POST /api/ai/insight-report -d '{}' returns 200 with report (or message if no snapshots)</verify>
  <done>API returns weekly report from snapshots</done>
</task>

<task type="auto">
  <name>Task 3: Add Generate Report button on Analytics page</name>
  <files>src/app/app/analytics/page.tsx</files>
  <action>
1. Add state: reportLoading, reportError, reportData
2. Add "Generate Report" or "Generate Weekly Report" button
3. On click: POST /api/ai/insight-report with optional { weekOf }
4. Display result: headline, wins, underperformers, patterns, recommendations, momentumScore
5. Handle no-snapshots message gracefully
  </action>
  <verify>npm run build; manual: add snapshots, click Generate Report, see report</verify>
  <done>Button triggers API; report displayed</done>
</task>

</tasks>

<verification>
- npm run build passes
- POST /api/ai/insight-report returns { headline, wins, underperformers, patterns, recommendations, momentumScore }
- Analytics page shows Generate Report button and report
- Edge case: no snapshots → friendly message
</verification>

<success_criteria>
- PRD Prompt 10 used verbatim
- Week boundaries documented
- insight-report category in AiUsageLog
</success_criteria>
