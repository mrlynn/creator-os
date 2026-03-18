import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
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

    const scriptText = sections.join('\n\n');
    const fullText = `${episode.title}\n\n${episode.description || ''}\n\n${scriptText}`.trim();

    if (!fullText) {
      return Response.json({ error: 'Episode has no content' }, { status: 400 });
    }

    const embedding = await embed(fullText);
    await Episode.findByIdAndUpdate(params.id, { $set: { embedding } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error embedding episode:', error);
    return Response.json(
      {
        error: 'Failed to embed episode',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
