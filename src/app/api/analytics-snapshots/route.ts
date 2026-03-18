import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AnalyticsSnapshot } from '@/lib/db/models/AnalyticsSnapshot';
import { CreateAnalyticsSnapshotSchema } from '@/lib/db/schemas';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    const query: Record<string, string> = {};
    if (episodeId) query.episodeId = episodeId;

    const snapshots = await AnalyticsSnapshot.find(query)
      .populate('episodeId')
      .sort({ snapshotDate: -1 })
      .lean();

    return Response.json({ data: snapshots });
  } catch (error) {
    console.error('Error fetching analytics snapshots:', error);
    return Response.json(
      {
        error: 'Failed to fetch analytics snapshots',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();

    const validationResult = CreateAnalyticsSnapshotSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const snapshot = await AnalyticsSnapshot.create({
      ...validationResult.data,
      snapshotDate: new Date(validationResult.data.snapshotDate),
    });

    await snapshot.populate('episodeId');

    return Response.json(snapshot, { status: 201 });
  } catch (error) {
    console.error('Error creating analytics snapshot:', error);
    return Response.json(
      {
        error: 'Failed to create analytics snapshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
