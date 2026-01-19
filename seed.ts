
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product, Symptom, Course, IProduct } from './server/models/Content.js';
import User from './server/models/User.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
}

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Clear existing data
        await Product.deleteMany({});
        await Symptom.deleteMany({});
        await Course.deleteMany({});
        // await User.deleteMany({}); // Keep users for now

        // 1. Create Products
        const products = await Product.insertMany([
            {
                name: 'Calm Spirit Blend',
                description: 'A soothing blend of chamomile, lavender, and lemon balm to ease anxiety and promote sleep.',
                price: 24.99,
                ingredients: ['Chamomile', 'Lavender', 'Lemon Balm', 'Valerian Root'],
                benefits: ['Reduces Anxiety', 'Improves Sleep', 'Relieves Stress'],
                tags: ['Sleep', 'Anxiety', 'Stress'],
                image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400',
                affiliateCommission: 15
            },
            {
                name: 'Digestive Harmony',
                description: 'Reset your gut with peppermint, ginger, and fennel. Perfect for bloating and indigestion.',
                price: 22.50,
                ingredients: ['Peppermint', 'Ginger', 'Fennel', 'Licorice Root'],
                benefits: ['Soothes Bloating', 'Aids Digestion', 'Reduces Nausea'],
                tags: ['Digestion', 'Bloating', 'Gut Health'],
                image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
                affiliateCommission: 15
            },
            {
                name: 'Immune Shield',
                description: 'Boost your defenses with elderberry, echinacea, and rosehips.',
                price: 26.00,
                ingredients: ['Elderberry', 'Echinacea', 'Rosehips', 'Ginger'],
                benefits: ['Boosts Immunity', 'Fights Colds', 'Vitamin C Rich'],
                tags: ['Immunity', 'Cold/Flu'],
                image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=400',
                affiliateCommission: 15
            }
        ]);

        console.log(`Seeded ${products.length} products`);

        // 2. Create Symptoms mapped to Products
        const symptoms = await Symptom.insertMany([
            {
                name: 'Anxiety',
                category: 'Mental Wellness',
                recommendedProductIds: [products[0]._id],
                educationalSnippet: 'Chronic anxiety creates excess heat in the body. Cooling herbs like Lemon Balm help regulate the nervous system.',
                ritual: 'Brew for 5-7 minutes covered to keep essential oils in. Inhale the steam deeply 3 times before your first sip.'
            },
            {
                name: 'Bloating',
                category: 'Uncomfortable Digestion',
                recommendedProductIds: [products[1]._id],
                educationalSnippet: 'Bloating is often a sign of "stagnant qi" or sluggish digestion. Warming herbs like Ginger stimulate gastric fire.',
                ritual: 'Drink 30 minutes after a meal. Avoid cold water with meals.'
            },
            {
                name: 'Cold & Flu',
                category: 'Immune Support',
                recommendedProductIds: [products[2]._id],
                educationalSnippet: 'At the first sign of a tickle in your throat, boost your intake of Vitamin C rich herbs like Rosehips.',
                ritual: 'Add a teaspoon of raw honey (antimicrobial) after the tea has cooled slightly so you don\'t kill the enzymes.'
            }
        ]);

        console.log(`Seeded ${symptoms.length} symptoms`);

        // 3. Create Courses
        const courses = await Course.insertMany([
            {
                title: 'Herbal Foundations',
                instructor: 'Dr. Althea Green',
                thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=400',
                lessons: 12,
                category: 'Beginner',
            },
            {
                title: 'Digestive Mastery',
                instructor: 'Sarah Jenkins',
                thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
                lessons: 8,
                category: 'Advanced',
            }
        ]);
        console.log(`Seeded ${courses.length} courses`);

        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
