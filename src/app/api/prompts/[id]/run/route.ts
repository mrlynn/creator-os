import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Prompt } from '@/lib/db/models/Prompt';
import { llmChat } from '@/lib/ai/llm-provider';
import { getProfileInstruction } from '@/lib/ai/instruction-profile';
import { getRagContext } from '@/lib/ai/rag-retrieval';
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
    const profileId = (body.profileId as string) || undefined;
    const includeRag = body.includeRag === true;
    const ragLimit = typeof body.ragLimit === 'number' ? body.ragLimit : 3;

    const filledTemplate = prompt.template.replace(
      /\{\{(\w+)\}\}/g,
      (_match: string, key: string) => variables[key] ?? ''
    );

    const profileInstruction = profileId
      ? await getProfileInstruction(profileId)
      : '';
    const ragContext =
      includeRag
        ? await getRagContext(
            filledTemplate.slice(0, 200),
            ['idea', 'episode', 'script'],
            ragLimit
          )
        : '';
    const userContent = ragContext
      ? `${filledTemplate}\n\n${ragContext}`
      : filledTemplate;
    const messages = profileInstruction
      ? [
          { role: 'system' as const, content: profileInstruction },
          { role: 'user' as const, content: userContent },
        ]
      : [{ role: 'user' as const, content: userContent }];

    const res = await llmChat({
      messages,
      temperature: 0.7,
      maxTokens: 4000,
      category: 'prompt-run',
    });

    return Response.json({ output: res.content });
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
