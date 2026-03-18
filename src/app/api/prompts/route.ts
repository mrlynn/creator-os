import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { Prompt } from '@/lib/db/models/Prompt';
import { CreatePromptSchema } from '@/lib/db/schemas';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const prompts = await Prompt.find().sort({ name: 1 }).lean();

    return Response.json({ data: prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return Response.json(
      {
        error: 'Failed to fetch prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const validationResult = CreatePromptSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const prompt = await Prompt.create(validationResult.data);

    return Response.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return Response.json(
      {
        error: 'Failed to create prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
