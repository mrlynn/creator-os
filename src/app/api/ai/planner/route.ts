import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { PublishingRecord } from '@/lib/db/models/PublishingRecord';
import { generateWeeklyPlan } from '@/lib/ai/planner';

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
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
    const monday = weekOfInput
      ? new Date(weekOfInput)
      : getMondayOfWeek(new Date());
    const weekOf = formatWeekOf(monday);

    const ideas = await ContentIdea.find({
      status: { $in: ['raw', 'validated'] },
    })
      .sort({ viralityScore: -1, createdAt: -1 })
      .lean();

    const ideasStr = ideas
      .map(
        (i) =>
          `${i.title} | ${i.audience} | ${i.platform} | ${i.viralityScore ?? '—'} | ${i._id}`
      )
      .join('\n');

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentRecords = await PublishingRecord.find({
      publishedDate: { $gte: twoWeeksAgo },
    })
      .populate('episodeId')
      .lean();

    const publishedRecently = recentRecords
      .map((r) => {
        const ep = r.episodeId as { title?: string } | null;
        const pubDate = (r as { publishedDate?: Date }).publishedDate;
        const dateStr = pubDate?.toISOString().slice(0, 10) ?? '—';
        return `${ep?.title ?? 'Unknown'} (${dateStr})`;
      })
      .join('\n');

    const result = await generateWeeklyPlan(
      {
        ideas: ideasStr,
        publishedRecently: publishedRecently || '(None in last 2 weeks)',
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
    console.error('Error generating plan:', error);
    return Response.json(
      {
        error: 'Failed to generate plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
