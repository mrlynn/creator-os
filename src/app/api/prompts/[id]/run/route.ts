import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Prompt } from '@/lib/db/models/Prompt';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { logAiUsage } from '@/lib/ai/usage-logger';
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

    const prompt = await Prompt.findById(params.id);
    if (!prompt) {
      return Response.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const variables = (body.variables as Record<string, string>) || {};

    const filledTemplate = prompt.template.replace(
      /\{\{(\w+)\}\}/g,
      (_match: string, key: string) => variables[key] ?? ''
    );

    const client = getOpenAIClient();
    const start = Date.now();

    const res = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: filledTemplate }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const output = res.choices[0].message?.content ?? '';

    logAiUsage({
      category: 'prompt-run',
      tokensUsed: res.usage?.total_tokens || 0,
      durationMs: Date.now() - start,
      success: true,
      relatedDocumentId: prompt._id,
      relatedDocumentType: 'Prompt',
    }).catch(console.error);

    return Response.json({ output });
  } catch (error) {
    console.error('Error running prompt:', error);
    return Response.json(
      {
        error: 'Failed to run prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
