import { connectToDatabase } from '@/lib/db/connection';
import { InstructionProfile } from '@/lib/db/models/InstructionProfile';
import { Types } from 'mongoose';

/**
 * Returns instruction text for a profile by ID.
 * Caller must ensure DB is connected (e.g. from API routes). This helper calls connectToDatabase() for robustness when invoked from AI libs.
 * @param profileId - MongoDB ObjectId string or null/undefined
 * @returns Instruction text or empty string if invalid/not found
 */
export async function getProfileInstruction(
  profileId: string | null | undefined
): Promise<string> {
  if (!profileId || !Types.ObjectId.isValid(profileId)) {
    return '';
  }

  await connectToDatabase();

  const doc = await InstructionProfile.findById(profileId)
    .select('instructionText')
    .lean() as { instructionText?: string } | null;

  return doc?.instructionText ?? '';
}
