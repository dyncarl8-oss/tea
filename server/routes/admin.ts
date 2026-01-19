
import express from 'express';
import User from '../models/User.js';
import { Product } from '../models/Content.js';
import { validateWhopToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin/stats', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        res.json({
            totalUsers: userCount,
            activeProducts: productCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

export default router;
