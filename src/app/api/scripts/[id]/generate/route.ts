import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { GenerateScriptSchema } from '@/lib/db/schemas';
import { generateScriptFromOutline } from '@/lib/ai/script-generator';
import { Types } from 'mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const validationResult = GenerateScriptSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const script = await Script.findById(params.id);
    if (!script) {
      return Response.json({ error: 'Script not found' }, { status: 404 });
    }

    // Call AI to generate script
    const aiResult = await generateScriptFromOutline(
      validationResult.data.outline,
      validationResult.data.audience || 'beginner',
      validationResult.data.profileId
    );

    if (!aiResult.success) {
      return Response.json(
        { error: 'Failed to generate script', message: aiResult.error },
        { status: 500 }
      );
    }

    // Update script with generated content
    script.outline = validationResult.data.outline;
    script.hook = aiResult.sections?.hook;
    script.problem = aiResult.sections?.problem;
    script.solution = aiResult.sections?.solution;
    script.demo = aiResult.sections?.demo;
    script.cta = aiResult.sections?.cta;
    script.outro = aiResult.sections?.outro;
    script.status = 'draft';

    // Calculate word count
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
    console.error('Error generating script:', error);
    return Response.json(
      { error: 'Failed to generate script', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
