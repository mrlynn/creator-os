import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { embed } from '@/lib/ai/embeddings';
import { Types } from 'mongoose';

export async function POST(
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

    const idea = await ContentIdea.findById(params.id);
    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const text = `${idea.title}\n\n${idea.description}`.trim();
    if (!text) {
      return Response.json({ error: 'Idea has no content' }, { status: 400 });
    }

    const embedding = await embed(text);
    await ContentIdea.findByIdAndUpdate(params.id, { $set: { embedding } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error embedding idea:', error);
    return Response.json(
      {
        error: 'Failed to embed idea',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
