import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { InstructionProfile } from '@/lib/db/models/InstructionProfile';
import { CreateInstructionProfileSchema } from '@/lib/db/schemas';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const profiles = await InstructionProfile.find()
      .sort({ name: 1 })
      .lean();

    return Response.json({ data: profiles });
  } catch (error) {
    console.error('Error fetching instruction profiles:', error);
    return Response.json(
      {
        error: 'Failed to fetch instruction profiles',
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

    const validationResult = CreateInstructionProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, instructionText, applicableOperations, isDefault } =
      validationResult.data;

    if (isDefault) {
      await InstructionProfile.updateMany(
        {},
        { $set: { isDefault: false } }
      );
    }

    const profile = await InstructionProfile.create({
      name,
      instructionText,
      applicableOperations: applicableOperations ?? ['*'],
      isDefault: isDefault ?? false,
    });

    return Response.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating instruction profile:', error);
    return Response.json(
      {
        error: 'Failed to create instruction profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
