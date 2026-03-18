import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { scoreEvergreen } from '@/lib/ai/evergreen-scorer';
import { Types } from 'mongoose';

export async function POST(
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

    const episode = await Episode.findById(params.id).populate('scriptId');
    if (!episode) {
      return Response.json({ error: 'Episode not found' }, { status: 404 });
    }

    const script = episode.scriptId as {
      hook?: string;
      problem?: string;
      solution?: string;
      demo?: string;
      cta?: string;
      outro?: string;
    } | null;

    const sections = script
      ? [
          script.hook,
          script.problem,
          script.solution,
          script.demo,
          script.cta,
          script.outro,
        ].filter(Boolean) as string[]
      : [];
    const scriptText = sections.join('\n\n').slice(0, 500);

    const body = await request.json().catch(() => ({}));
    const profileId = (body.profileId as string) || undefined;

    const result = await scoreEvergreen(
      {
        _id: episode._id.toString(),
        title: episode.title,
        scriptText: scriptText || undefined,
      },
      profileId
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    await Episode.findByIdAndUpdate(params.id, {
      $set: {
        'aiMetadata.evergreenScore': result.evergreenScore,
        'aiMetadata.evergreenReasoning': result.reasoning,
      },
    });

    return Response.json({
      evergreenScore: result.evergreenScore,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error('Error scoring evergreen:', error);
    return Response.json(
      {
        error: 'Failed to score evergreen',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
