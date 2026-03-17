import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AiUsageLog } from '@/lib/db/models/AiUsageLog';

// Cost per 1k tokens (approximate, gpt-4-turbo pricing)
const COST_PER_1K_TOKENS = 0.01;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total summary
    const totals = await AiUsageLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokensUsed' },
          totalRequests: { $sum: 1 },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
    ]);

    const summary = totals[0] || {
      totalTokens: 0,
      totalRequests: 0,
      successCount: 0,
      avgDurationMs: 0,
    };

    summary.estimatedCost = (summary.totalTokens / 1000) * COST_PER_1K_TOKENS;
    summary.successRate =
      summary.totalRequests > 0
        ? Math.round((summary.successCount / summary.totalRequests) * 100)
        : 100;

    // By category
    const byCategory = await AiUsageLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$category',
          tokens: { $sum: '$tokensUsed' },
          requests: { $sum: 1 },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
      { $sort: { tokens: -1 } },
    ]);

    const categorySummary = byCategory.map((c) => ({
      category: c._id,
      tokens: c.tokens,
      requests: c.requests,
      estimatedCost: (c.tokens / 1000) * COST_PER_1K_TOKENS,
      successRate: Math.round((c.successCount / c.requests) * 100),
      avgDurationMs: Math.round(c.avgDurationMs),
    }));

    // Daily usage for sparkline (last 14 days)
    const dailyUsage = await AiUsageLog.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 86400000) } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          tokens: { $sum: '$tokensUsed' },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent logs
    const recentLogs = await AiUsageLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return Response.json({
      summary,
      byCategory: categorySummary,
      dailyUsage,
      recentLogs,
      period: { days, since },
    });
  } catch (error) {
    console.error('Error fetching AI usage logs:', error);
    return Response.json(
      { error: 'Failed to fetch usage logs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
