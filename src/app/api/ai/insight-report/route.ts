import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AnalyticsSnapshot } from '@/lib/db/models/AnalyticsSnapshot';
import { generateWeeklyReport } from '@/lib/ai/insight-reporter';

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function formatWeekOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json().catch(() => ({}));
    const weekOfInput = body.weekOf as string | undefined;
    const profileId = (body.profileId as string) || undefined;
    const refDate = weekOfInput ? new Date(weekOfInput) : new Date();
    const thisWeek = getWeekBounds(refDate);
    const prevWeekStart = new Date(thisWeek.start);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeek = getWeekBounds(prevWeekStart);
    const weekOf = formatWeekOf(thisWeek.start);

    const thisWeekSnapshots = await AnalyticsSnapshot.find({
      snapshotDate: { $gte: thisWeek.start, $lte: thisWeek.end },
    })
      .populate('episodeId')
      .lean();

    const prevWeekSnapshots = await AnalyticsSnapshot.find({
      snapshotDate: { $gte: prevWeek.start, $lte: prevWeek.end },
    })
      .populate('episodeId')
      .lean();

    function buildMetricsString(snapshots: Array<Record<string, unknown>>): string {
      const byEpisode = new Map<
        string,
        { title: string; views: number; likes: number; comments: number; shares: number }
      >();
      for (const s of snapshots) {
        const ep = s.episodeId as { _id?: unknown; title?: string } | null;
        const key = ep?._id?.toString() ?? 'unknown';
        const title = ep?.title ?? 'Unknown';
        const existing = byEpisode.get(key);
        const views = (existing?.views ?? 0) + (Number(s.viewCount) || 0);
        const likes = (existing?.likes ?? 0) + (Number(s.likeCount) || 0);
        const comments = (existing?.comments ?? 0) + (Number(s.commentCount) || 0);
        const shares = (existing?.shares ?? 0) + (Number(s.shareCount) || 0);
        byEpisode.set(key, { title, views, likes, comments, shares });
      }
      return Array.from(byEpisode.values())
        .map((e) => {
          const engagement =
            e.views > 0 ? (((e.likes + e.comments + e.shares) / e.views) * 100).toFixed(1) : '0';
          return `${e.title}: ${e.views} views, ${e.likes} likes, ${e.comments} comments, ${engagement}% engagement`;
        })
        .join('\n');
    }

    const metricsData = buildMetricsString(thisWeekSnapshots);
    const previousWeekData = buildMetricsString(prevWeekSnapshots);

    if (!metricsData && !previousWeekData) {
      return Response.json({
        message: 'Add analytics snapshots to generate reports',
        headline: 'No data yet',
        wins: [],
        underperformers: [],
        patterns: [],
        recommendations: ['Add metrics for your published content to get weekly insights.'],
        momentumScore: 5,
      });
    }

    const result = await generateWeeklyReport(
      {
        metricsData: metricsData || '(No data this week)',
        previousWeekData: previousWeekData || '(No data previous week)',
        weekOf,
      },
      profileId
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json(
      {
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
