import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { UpdateEpisodeSchema } from '@/lib/db/schemas';
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

    const episode = await Episode.findById(params.id)
      .populate('ideaId')
      .populate('scriptId')
      .populate('seriesId')
      .populate('tags')
      .populate('publishingRecords');

    if (!episode) {
      return Response.json({ error: 'Episode not found' }, { status: 404 });
    }

    return Response.json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    return Response.json(
      { error: 'Failed to fetch episode', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const validationResult = UpdateEpisodeSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const episode = await Episode.findByIdAndUpdate(params.id, validationResult.data, {
      new: true,
      runValidators: true,
    })
      .populate('ideaId')
      .populate('scriptId')
      .populate('seriesId')
      .populate('tags')
      .populate('publishingRecords');

    if (!episode) {
      return Response.json({ error: 'Episode not found' }, { status: 404 });
    }

    return Response.json(episode);
  } catch (error) {
    console.error('Error updating episode:', error);
    return Response.json(
      { error: 'Failed to update episode', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
