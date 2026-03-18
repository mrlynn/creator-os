import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { generateSeo } from '@/lib/ai/seo-generator';
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

    const episode = await Episode.findById(params.id)
      .populate('scriptId')
      .populate('tags');
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
    const contentForSeo = scriptText.trim() || (episode.description || '');

    const tags = episode.tags as { name?: string }[] | undefined;
    const tagNames = Array.isArray(tags)
      ? tags.map((t) => (typeof t === 'object' && t?.name ? t.name : String(t)))
      : [];

    if (!episode.title && !contentForSeo) {
      return Response.json(
        { error: 'Episode has no content' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const profileId = (body.profileId as string) || undefined;
    const includeRag = body.includeRag === true;
    const ragLimit = typeof body.ragLimit === 'number' ? body.ragLimit : undefined;

    const result = await generateSeo(
      {
        _id: episode._id.toString(),
        title: episode.title,
        scriptText: contentForSeo,
        tags: tagNames,
      },
      profileId,
      { includeRag, ragLimit }
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error('Error generating SEO:', error);
    return Response.json(
      {
        error: 'Failed to generate SEO',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
