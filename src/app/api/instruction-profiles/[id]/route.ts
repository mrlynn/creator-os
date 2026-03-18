import { connectToDatabase } from '@/lib/db/connection';
import { getServerSession } from '@/lib/auth';
import { InstructionProfile } from '@/lib/db/models/InstructionProfile';
import { UpdateInstructionProfileSchema } from '@/lib/db/schemas';
import { Types } from 'mongoose';

export async function GET(
  _request: Request,
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

    const profile = await InstructionProfile.findById(params.id).lean();
    if (!profile) {
      return Response.json(
        { error: 'Instruction profile not found' },
        { status: 404 }
      );
    }

    return Response.json(profile);
  } catch (error) {
    console.error('Error fetching instruction profile:', error);
    return Response.json(
      {
        error: 'Failed to fetch instruction profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const validationResult = UpdateInstructionProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { isDefault, ...rest } = validationResult.data;

    if (isDefault) {
      await InstructionProfile.updateMany(
        { _id: { $ne: params.id } },
        { $set: { isDefault: false } }
      );
    }

    const profile = await InstructionProfile.findByIdAndUpdate(
      params.id,
      { $set: { ...rest, ...(isDefault !== undefined && { isDefault }) } },
      { new: true, runValidators: true }
    ).lean();

    if (!profile) {
      return Response.json(
        { error: 'Instruction profile not found' },
        { status: 404 }
      );
    }

    return Response.json(profile);
  } catch (error) {
    console.error('Error updating instruction profile:', error);
    return Response.json(
      {
        error: 'Failed to update instruction profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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

    const profile = await InstructionProfile.findByIdAndDelete(params.id);

    if (!profile) {
      return Response.json(
        { error: 'Instruction profile not found' },
        { status: 404 }
      );
    }

    return Response.json({ message: 'Instruction profile deleted' });
  } catch (error) {
    console.error('Error deleting instruction profile:', error);
    return Response.json(
      {
        error: 'Failed to delete instruction profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
