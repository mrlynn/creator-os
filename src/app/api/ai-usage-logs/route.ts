import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AiUsageLog } from '@/lib/db/models/AiUsageLog';

const FALLBACK_COST_PER_1K = 0.01;

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

    const matchStage = [
      {
        $addFields: {
          _effectiveDate: { $ifNull: ['$createdAt', { $toDate: '$_id' }] },
        },
      },
      { $match: { _effectiveDate: { $gte: since } } },
    ];

    // Total summary (use stored costEstimate when available)
    const totals = await AiUsageLog.aggregate([
      ...matchStage,
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokensUsed' },
          totalCost: { $sum: { $ifNull: ['$costEstimate', 0] } },
          totalRequests: { $sum: 1 },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
    ]);

    const raw = totals[0] || {
      totalTokens: 0,
      totalCost: 0,
      totalRequests: 0,
      successCount: 0,
      avgDurationMs: 0,
    };

    const summary = {
      ...raw,
      estimatedCost: raw.totalCost > 0
        ? Math.round(raw.totalCost * 10000) / 10000
        : (raw.totalTokens / 1000) * FALLBACK_COST_PER_1K,
      successRate:
        raw.totalRequests > 0
          ? Math.round((raw.successCount / raw.totalRequests) * 100)
          : 100,
    };

    // By category
    const byCategory = await AiUsageLog.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$category',
          tokens: { $sum: '$tokensUsed' },
          cost: { $sum: { $ifNull: ['$costEstimate', 0] } },
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
      estimatedCost:
        c.cost > 0
          ? Math.round(c.cost * 10000) / 10000
          : (c.tokens / 1000) * FALLBACK_COST_PER_1K,
      successRate: Math.round((c.successCount / c.requests) * 100),
      avgDurationMs: Math.round(c.avgDurationMs),
    }));

    // By model
    const byModel = await AiUsageLog.aggregate([
      ...matchStage,
      {
        $group: {
          _id: { model: '$aiModel', provider: { $ifNull: ['$provider', 'openai'] } },
          tokens: { $sum: '$tokensUsed' },
          cost: { $sum: { $ifNull: ['$costEstimate', 0] } },
          requests: { $sum: 1 },
        },
      },
      { $sort: { tokens: -1 } },
    ]);

    const modelSummary = byModel.map((m) => ({
      model: m._id.model,
      provider: m._id.provider,
      tokens: m.tokens,
      requests: m.requests,
      estimatedCost:
        m.cost > 0
          ? Math.round(m.cost * 10000) / 10000
          : (m.tokens / 1000) * FALLBACK_COST_PER_1K,
    }));

    // Daily usage for sparkline (last 14 days)
    const dailySince = new Date(Date.now() - 14 * 86400000);
    const dailyUsage = await AiUsageLog.aggregate([
      { $addFields: { _effectiveDate: { $ifNull: ['$createdAt', { $toDate: '$_id' }] } } },
      { $match: { _effectiveDate: { $gte: dailySince } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$_effectiveDate' },
          },
          tokens: { $sum: '$tokensUsed' },
          cost: { $sum: { $ifNull: ['$costEstimate', 0] } },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyUsageFormatted = dailyUsage.map((d) => ({
      date: d._id,
      tokens: d.tokens,
      estimatedCost: d.cost > 0 ? Math.round(d.cost * 10000) / 10000 : (d.tokens / 1000) * FALLBACK_COST_PER_1K,
      requests: d.requests,
    }));

    // Recent logs
    const recentLogs = await AiUsageLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return Response.json({
      summary,
      byCategory: categorySummary,
      byModel: modelSummary,
      dailyUsage: dailyUsageFormatted,
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
