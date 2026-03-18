import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Prompt } from '@/lib/db/models/Prompt';
import { UpdatePromptSchema } from '@/lib/db/schemas';
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

    const prompt = await Prompt.findById(params.id).lean();
    if (!prompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return Response.json(
      {
        error: 'Failed to fetch prompt',
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
    const validationResult = UpdatePromptSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const prompt = await Prompt.findByIdAndUpdate(
      params.id,
      { $set: validationResult.data },
      { new: true, runValidators: true }
    ).lean();

    if (!prompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return Response.json(
      {
        error: 'Failed to update prompt',
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

    const prompt = await Prompt.findByIdAndDelete(params.id);

    if (!prompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return Response.json({ message: 'Prompt deleted' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return Response.json(
      {
        error: 'Failed to delete prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
