import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Episode } from '@/lib/db/models/Episode';
import { Script } from '@/lib/db/models/Script';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const parentEpisodeId = body.parentEpisodeId as string;
    const clip = body.clip as {
      conceptTitle?: string;
      newHook?: string;
      script?: string;
    };

    if (!parentEpisodeId || !clip) {
      return Response.json(
        { error: 'parentEpisodeId and clip are required' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(parentEpisodeId)) {
      return Response.json({ error: 'Invalid parentEpisodeId' }, { status: 400 });
    }

    const parentEpisode = await Episode.findById(parentEpisodeId)
      .populate('ideaId')
      .lean();

    if (!parentEpisode) {
      return Response.json({ error: 'Episode not found' }, { status: 404 });
    }

    const ideaId = parentEpisode.ideaId;
    const ideaIdObj =
      typeof ideaId === 'object' && ideaId !== null && '_id' in ideaId
        ? (ideaId as { _id: Types.ObjectId })._id
        : ideaId;

    if (!ideaIdObj) {
      return Response.json(
        { error: 'Parent episode has no linked idea' },
        { status: 400 }
      );
    }

    const conceptTitle =
      (clip.conceptTitle as string)?.trim() || 'Untitled Clip';
    const newHook = (clip.newHook as string)?.trim() || '';
    const scriptContent = (clip.script as string)?.trim() || '';

    const newScript = await Script.create({
      ideaId: ideaIdObj,
      title: conceptTitle,
      outline: scriptContent,
      hook: newHook,
      status: 'draft',
    });

    const newEpisode = await Episode.create({
      ideaId: ideaIdObj,
      scriptId: newScript._id,
      title: conceptTitle,
      description: scriptContent,
    });

    const episodeObj = newEpisode.toObject();
    return Response.json(
      {
        episode: {
          _id: newEpisode._id.toString(),
          title: episodeObj.title,
          description: episodeObj.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating episode from clip:', error);
    return Response.json(
      {
        error: 'Failed to create episode from clip',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
