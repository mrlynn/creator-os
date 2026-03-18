import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Script } from '@/lib/db/models/Script';
import { GenerateHooksSchema } from '@/lib/db/schemas';
import { generateHooks } from '@/lib/ai/hook-generator';
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

    const validationResult = GenerateHooksSchema.safeParse(body);
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

    // Generate hooks
    const hooksResult = await generateHooks(
      validationResult.data.scriptContent,
      validationResult.data.audienceLevel || 'beginner',
      validationResult.data.profileId,
      {
        includeRag: validationResult.data.includeRag,
        ragLimit: validationResult.data.ragLimit,
      }
    );

    if (!hooksResult.success) {
      return Response.json(
        { error: 'Failed to generate hooks', message: hooksResult.error },
        { status: 500 }
      );
    }

    // Update script with hooks
    script.youtubeHooks = hooksResult.youtubeHooks || [];
    script.tiktokHooks = hooksResult.tiktokHooks || [];

    await script.save();

    return Response.json({
      youtubeHooks: hooksResult.youtubeHooks,
      tiktokHooks: hooksResult.tiktokHooks,
      generation: {
        tokensUsed: hooksResult.tokensUsed,
        durationMs: hooksResult.durationMs,
      },
    });
  } catch (error) {
    console.error('Error generating hooks:', error);
    return Response.json(
      { error: 'Failed to generate hooks', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
