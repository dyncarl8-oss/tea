
import './config.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import symptomRoutes from './routes/symptoms.js';
import productRoutes from './routes/products.js';
import contentRoutes from './routes/content.js';
import affiliateRoutes from './routes/affiliate.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined. Ensure it is set in environment variables.');
    // Don't exit in build step if needed, but for server it's critical
    if (process.env.NODE_ENV === 'production') {
        // process.exit(1);
    }
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', symptomRoutes);
app.use('/api', productRoutes);
app.use('/api', contentRoutes);
app.use('/api', affiliateRoutes);
app.use('/api', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const publicPath = path.resolve(__dirname, '../client');

    app.use(express.static(publicPath));

    // Catch-all route for SPA
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
