import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { PublishingRecord } from '@/lib/db/models/PublishingRecord';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  extendedProps: { episodeId: string; platform: string };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    const start = startParam ? new Date(startParam) : new Date();
    const end = endParam ? new Date(endParam) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const records = await PublishingRecord.find({
      $or: [
        { scheduledDate: { $gte: start, $lte: end } },
        { publishedDate: { $gte: start, $lte: end } },
      ],
    })
      .populate('episodeId')
      .lean();

    const events: CalendarEvent[] = [];

    for (const rec of records) {
      const date = rec.status === 'scheduled' && rec.scheduledDate
        ? rec.scheduledDate
        : rec.publishedDate;

      if (!date) continue;

      const episode = rec.episodeId as { _id: string; title?: string } | null;
      const title = episode?.title || 'Untitled';
      const episodeId = typeof rec.episodeId === 'object' && rec.episodeId?._id
        ? String(rec.episodeId._id)
        : String(rec.episodeId);

      events.push({
        id: String(rec._id),
        title: `${title} (${rec.platform})`,
        date: new Date(date).toISOString().slice(0, 10),
        extendedProps: { episodeId, platform: rec.platform },
      });
    }

    return Response.json({ data: events });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return Response.json(
      {
        error: 'Failed to fetch calendar',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
