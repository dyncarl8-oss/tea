
import express from 'express';
import { AuthRequest, validateWhopToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/affiliate/stats', validateWhopToken, async (req: AuthRequest, res) => {
    // Mock data for now, would fetch from DB/Whop
    res.json({
        totalEarnings: 1250.50,
        pendingPayout: 150.00,
        recentConversions: 12,
        revenue: [
            { date: 'Oct 1', amount: 450 },
            { date: 'Oct 8', amount: 620 },
            { date: 'Oct 15', amount: 840 },
            { date: 'Oct 22', amount: 1250 }
        ]
    });
});

export default router;
