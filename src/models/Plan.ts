import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  id: string;
  name: string;
  duration: string;
  fee: number;
  features: string[];
  installmentEligible: boolean;
  popular: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    id:                  { type: String, required: true, unique: true, trim: true, lowercase: true },
    name:                { type: String, required: true, trim: true },
    duration:            { type: String, required: true, trim: true },
    fee:                 { type: Number, required: true, min: 0 },
    features:            { type: [String], default: [] },
    installmentEligible: { type: Boolean, default: true },
    popular:             { type: Boolean, default: false },
    isActive:            { type: Boolean, default: true },
    order:               { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Plan: Model<IPlan> =
  mongoose.models.Plan ?? mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;
