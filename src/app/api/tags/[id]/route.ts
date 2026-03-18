import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Tag } from '@/lib/db/models/Tag';
import { UpdateTagSchema } from '@/lib/db/schemas';
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

    const tag = await Tag.findById(params.id).lean();
    if (!tag) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    return Response.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return Response.json(
      { error: 'Failed to fetch tag', message: error instanceof Error ? error.message : 'Unknown error' },
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
    const validationResult = UpdateTagSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const tag = await Tag.findByIdAndUpdate(
      params.id,
      { $set: validationResult.data },
      { new: true, runValidators: true }
    ).lean();

    if (!tag) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    return Response.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return Response.json(
      { error: 'Failed to update tag', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const tag = await Tag.findByIdAndDelete(params.id);

    if (!tag) {
      return Response.json({ error: 'Tag not found' }, { status: 404 });
    }

    return Response.json({ message: 'Tag deleted' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return Response.json(
      { error: 'Failed to delete tag', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
