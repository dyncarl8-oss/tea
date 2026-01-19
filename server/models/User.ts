
import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'guest' | 'member' | 'affiliate' | 'admin';

export interface IUser extends Document {
    whopUserId: string;
    username: string;
    email?: string;
    avatar?: string;
    role: UserRole;
    affiliateCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    whopUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String },
    avatar: { type: String },
    role: {
        type: String,
        enum: ['guest', 'member', 'affiliate', 'admin'],
        default: 'guest'
    },
    affiliateCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
