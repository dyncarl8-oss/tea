
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    image: string;
    ingredients: string[];
    benefits: string[];
    tags: string[];
    affiliateCommission: number; // Percentage or fixed amount
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    ingredients: [{ type: String }],
    benefits: [{ type: String }],
    tags: [{ type: String }],
    affiliateCommission: { type: Number, default: 0 }
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

export interface ISymptom extends Document {
    name: string;
    category: string;
    recommendedProductIds: mongoose.Types.ObjectId[];
    educationalSnippet: string;
    ritual: string;
}

const SymptomSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    recommendedProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    educationalSnippet: { type: String },
    ritual: { type: String }
});

export const Symptom = mongoose.model<ISymptom>('Symptom', SymptomSchema);

export interface ICourse extends Document {
    title: string;
    instructor: string;
    thumbnail: string;
    lessons: number;
    progress: number;
    category: string;
    locked?: boolean;
}

const CourseSchema: Schema = new Schema({
    title: { type: String, required: true },
    instructor: { type: String },
    thumbnail: { type: String },
    lessons: { type: Number, default: 0 },
    category: { type: String },
    // progress is usually user-specific, so we might not store it here effectively without a separate 'Enrollment' model.
    // We'll mock it or store it in User.
});

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
