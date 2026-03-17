import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Series } from '@/lib/db/models/Series';
import { UpdateSeriesSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const series = await Series.findById(params.id).lean();
    if (!series) {
      return Response.json({ error: 'Series not found' }, { status: 404 });
    }

    return Response.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return Response.json(
      { error: 'Failed to fetch series', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const validationResult = UpdateSeriesSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const series = await Series.findByIdAndUpdate(
      params.id,
      { $set: validationResult.data },
      { new: true, runValidators: true }
    ).lean();

    if (!series) {
      return Response.json({ error: 'Series not found' }, { status: 404 });
    }

    return Response.json(series);
  } catch (error) {
    console.error('Error updating series:', error);
    return Response.json(
      { error: 'Failed to update series', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const series = await Series.findByIdAndUpdate(
      params.id,
      { $set: { status: 'archived' } },
      { new: true }
    ).lean();

    if (!series) {
      return Response.json({ error: 'Series not found' }, { status: 404 });
    }

    return Response.json({ message: 'Series archived', series });
  } catch (error) {
    console.error('Error archiving series:', error);
    return Response.json(
      { error: 'Failed to archive series', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
