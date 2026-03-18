import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructionProfile extends Document {
  name: string;
  instructionText: string;
  applicableOperations: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstructionProfileSchema = new Schema<IInstructionProfile>(
  {
    name: {
      type: String,
      required: true,
    },
    instructionText: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    applicableOperations: {
      type: [String],
      default: ['*'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const InstructionProfile =
  mongoose.models.InstructionProfile ||
  mongoose.model<IInstructionProfile>('InstructionProfile', InstructionProfileSchema);
