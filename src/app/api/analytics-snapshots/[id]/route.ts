import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { AnalyticsSnapshot } from '@/lib/db/models/AnalyticsSnapshot';
import { UpdateAnalyticsSnapshotSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const snapshot = await AnalyticsSnapshot.findById(params.id).populate(
      'episodeId'
    );

    if (!snapshot) {
      return Response.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    return Response.json(snapshot);
  } catch (error) {
    console.error('Error fetching analytics snapshot:', error);
    return Response.json(
      {
        error: 'Failed to fetch analytics snapshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const validationResult = UpdateAnalyticsSnapshotSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { ...validationResult.data };
    if (update.snapshotDate) {
      update.snapshotDate = new Date(update.snapshotDate as string);
    }

    const snapshot = await AnalyticsSnapshot.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    ).populate('episodeId');

    if (!snapshot) {
      return Response.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    return Response.json(snapshot);
  } catch (error) {
    console.error('Error updating analytics snapshot:', error);
    return Response.json(
      {
        error: 'Failed to update analytics snapshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const snapshot = await AnalyticsSnapshot.findByIdAndDelete(params.id);

    if (!snapshot) {
      return Response.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    return Response.json({ message: 'Snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting analytics snapshot:', error);
    return Response.json(
      {
        error: 'Failed to delete analytics snapshot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
