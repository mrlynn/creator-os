import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { scoreVirality } from '@/lib/ai/virality-scorer';
import { Types } from 'mongoose';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
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

    const result = await scoreVirality({
      _id: idea._id.toString(),
      title: idea.title,
      description: idea.description,
      platform: idea.platform,
      audience: idea.audience,
      format: idea.format,
    });

    if (!result.success) {
      return Response.json(
        { error: 'Failed to score virality', message: result.error },
        { status: 500 }
      );
    }

    const updated = await ContentIdea.findByIdAndUpdate(
      params.id,
      {
        viralityScore: result.viralityScore,
        viralityReasoning: result.viralityReasoning,
      },
      { new: true }
    ).populate('tags');

    return Response.json({
      idea: updated,
      viralityScore: result.viralityScore,
      viralityReasoning: result.viralityReasoning,
    });
  } catch (error) {
    console.error('Error scoring virality:', error);
    return Response.json(
      {
        error: 'Failed to score virality',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
