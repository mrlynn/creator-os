import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { generateOutlineFromIdea } from '@/lib/ai/script-generator';
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
      return Response.json({ error: 'Invalid idea ID' }, { status: 400 });
    }

    const idea = await ContentIdea.findById(params.id);
    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const result = await generateOutlineFromIdea({
      title: idea.title,
      description: idea.description,
      platform: idea.platform,
      audience: idea.audience,
      format: idea.format,
    });

    if (!result.success) {
      return Response.json(
        { error: 'Failed to generate outline', message: result.error },
        { status: 500 }
      );
    }

    return Response.json({ outline: result.outline });
  } catch (error) {
    console.error('Outline generation error:', error);
    return Response.json(
      {
        error: 'Outline generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
