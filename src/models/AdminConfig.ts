import mongoose, { Document, Model, Schema } from 'mongoose';
import { createHash, randomBytes } from 'crypto';

export interface IAdminConfig extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const AdminConfigSchema = new Schema<IAdminConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdminConfig: Model<IAdminConfig> =
  mongoose.models.AdminConfig ??
  mongoose.model<IAdminConfig>('AdminConfig', AdminConfigSchema);

export default AdminConfig;

// Helper functions for password hashing
const PEPPER = process.env.ADMIN_SECRET ?? 'default-pepper-change-in-production';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt + PEPPER)
    .digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const inputHash = createHash('sha256')
    .update(password + salt + PEPPER)
    .digest('hex');
  return inputHash === hash;
}

export async function getAdminPassword(): Promise<string | null> {
  const config = await AdminConfig.findOne({ key: 'admin_password' }).lean();
  return config?.value ?? null;
}

export async function setAdminPassword(password: string): Promise<void> {
  const hashed = hashPassword(password);
  await AdminConfig.findOneAndUpdate(
    { key: 'admin_password' },
    { key: 'admin_password', value: hashed },
    { upsert: true, new: true }
  );
}
