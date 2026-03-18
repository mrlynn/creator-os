import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { generateClipConcepts } from '@/lib/ai/repurposing-engine';
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

    if (!script) {
      return Response.json(
        { error: 'Episode has no script' },
        { status: 400 }
      );
    }

    const sections = [
      script.hook,
      script.problem,
      script.solution,
      script.demo,
      script.cta,
      script.outro,
    ].filter(Boolean) as string[];

    const scriptText = sections.join('\n\n');
    if (!scriptText.trim()) {
      return Response.json(
        { error: 'Script has no content' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const platform = (body.platform as string) || 'tiktok';

    const result = await generateClipConcepts(
      scriptText,
      episode.title,
      platform
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({ clips: result.clips });
  } catch (error) {
    console.error('Error repurposing episode:', error);
    return Response.json(
      {
        error: 'Failed to repurpose episode',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
