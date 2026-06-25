import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgram extends Document {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isFree: boolean;
  isLimited: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    id:          { type: String, required: true, unique: true, trim: true, lowercase: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    color:       { type: String, required: true, default: 'from-indigo-500 to-purple-600' },
    icon:        { type: String, required: true, default: 'Code' },
    isFree:      { type: Boolean, default: false },
    isLimited:   { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Program: Model<IProgram> =
  mongoose.models.Program ?? mongoose.model<IProgram>('Program', ProgramSchema);

export default Program;
