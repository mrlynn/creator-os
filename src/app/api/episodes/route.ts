import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { CreateEpisodeSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreateEpisodeSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { ideaId, scriptId } = validationResult.data;

    if (!Types.ObjectId.isValid(ideaId) || !Types.ObjectId.isValid(scriptId)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const episode = await Episode.create({
      ...validationResult.data,
      ideaId: new Types.ObjectId(ideaId),
      scriptId: new Types.ObjectId(scriptId),
    });

    return Response.json(episode, { status: 201 });
  } catch (error) {
    console.error('Error creating episode:', error);
    return Response.json(
      { error: 'Failed to create episode', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const publishingStatus = searchParams.get('publishingStatus');
    const editingStatus = searchParams.get('editingStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, any> = {};
    if (publishingStatus) query.publishingStatus = publishingStatus;
    if (editingStatus) query.editingStatus = editingStatus;

    const episodes = await Episode.find(query)
      .populate('ideaId')
      .populate('scriptId')
      .populate('publishingRecords')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Episode.countDocuments(query);

    return Response.json({
      data: episodes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return Response.json(
      { error: 'Failed to fetch episodes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
