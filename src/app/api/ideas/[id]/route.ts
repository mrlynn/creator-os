import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { UpdateIdeaSchema } from '@/lib/db/schemas';
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

    const idea = await ContentIdea.findById(params.id).populate('tags');

    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    return Response.json(idea);
  } catch (error) {
    console.error('Error fetching idea:', error);
    return Response.json(
      { error: 'Failed to fetch idea', message: error instanceof Error ? error.message : 'Unknown error' },
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

    // Validate input
    const validationResult = UpdateIdeaSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const idea = await ContentIdea.findByIdAndUpdate(params.id, validationResult.data, {
      new: true,
      runValidators: true,
    }).populate('tags');

    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    return Response.json(idea);
  } catch (error) {
    console.error('Error updating idea:', error);
    return Response.json(
      { error: 'Failed to update idea', message: error instanceof Error ? error.message : 'Unknown error' },
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

    // Soft delete by setting status to archived
    const idea = await ContentIdea.findByIdAndUpdate(
      params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    return Response.json({ message: 'Idea archived successfully', idea });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return Response.json(
      { error: 'Failed to delete idea', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
