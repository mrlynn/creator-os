import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { ContentIdea } from '@/lib/db/models/ContentIdea';
import { Script } from '@/lib/db/models/Script';
import { generateScriptFromOutline } from '@/lib/ai/script-generator';
import { Types } from 'mongoose';
import { z } from 'zod';

const CreateAndGenerateSchema = z.object({
  outline: z.string().min(1),
  audience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

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
      return Response.json({ error: 'Invalid idea ID' }, { status: 400 });
    }

    const body = await request.json();
    const parseResult = CreateAndGenerateSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { outline, audience } = parseResult.data;

    const idea = await ContentIdea.findById(params.id);
    if (!idea) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const audienceLevel =
      audience ||
      (idea.audience === 'advanced'
        ? 'advanced'
        : idea.audience === 'intermediate'
          ? 'intermediate'
          : 'beginner');

    const script = await Script.create({
      ideaId: idea._id,
      title: idea.title,
      outline,
      status: 'outline',
      versions: [],
      youtubeHooks: [],
      tiktokHooks: [],
    });

    const aiResult = await generateScriptFromOutline(
      outline,
      audienceLevel,
      null,
      { includeRag: false }
    );

    if (!aiResult.success) {
      await Script.findByIdAndDelete(script._id);
      return Response.json(
        { error: 'Script generation failed', message: aiResult.error },
        { status: 500 }
      );
    }

    script.outline = outline;
    script.hook = aiResult.sections?.hook;
    script.problem = aiResult.sections?.problem;
    script.solution = aiResult.sections?.solution;
    script.demo = aiResult.sections?.demo;
    script.cta = aiResult.sections?.cta;
    script.outro = aiResult.sections?.outro;
    script.status = 'draft';

    const allText = [
      script.hook,
      script.problem,
      script.solution,
      script.demo,
      script.cta,
      script.outro,
    ]
      .filter(Boolean)
      .join(' ');
    script.wordCount = allText.split(/\s+/).length;

    await script.save();
    await script.populate('ideaId');

    return Response.json({
      script,
      generation: {
        tokensUsed: aiResult.tokensUsed,
        durationMs: aiResult.durationMs,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Create and generate script error:', err.message, err.stack);
    return Response.json(
      {
        error: 'Failed to create script',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
