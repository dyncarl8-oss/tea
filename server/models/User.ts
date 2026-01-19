
import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'guest' | 'member' | 'affiliate' | 'admin';

export interface IUser extends Document {
    whopUserId: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    role: UserRole;
    affiliateId?: string;
    metadata?: Map<string, string>;
    lastSync: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    whopUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: String,
    avatarUrl: String,
    role: { type: String, enum: ['guest', 'member', 'affiliate', 'admin'], default: 'guest' },
    affiliateId: String,
    metadata: { type: Map, of: String },
    lastSync: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
