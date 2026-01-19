
import express from 'express';
import WhopSDK from '@whop/sdk';
import User from '../models/User.js';
import { validateWhopToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const sdk = new WhopSDK.Whop({ apiKey: process.env.WHOP_API_KEY });

// Login / Sync Route
router.post('/login', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const { whopUserId } = req.user!;

        // 1. Fetch User from Whop with expanded info
        let whopUser: any;
        try {
            whopUser = await sdk.users.retrieve(whopUserId);
        } catch (e) {
            // Fallback for different SDK versions
            whopUser = await (sdk.users as any).retrieve({ userId: whopUserId });
        }

        // 2. Advanced Role Detection
        let role = 'guest';

        // Check Membership status for 'member' role
        try {
            const memberships = await (sdk as any).customers.listMemberships({
                userId: whopUserId
            });
            const hasActiveMembership = memberships.data?.some((m: any) => m.status === 'active');
            if (hasActiveMembership) role = 'member';
        } catch (e) {
            console.log('Membership check failed');
        }

        // Check Admin status
        if ((whopUser as any).is_admin || (whopUser as any).role === 'admin') {
            role = 'admin';
        }

        // 3. Update or Create Local User
        const user = await User.findOneAndUpdate(
            { whopUserId },
            {
                username: whopUser.username || 'User',
                email: whopUser.email,
                avatarUrl: (whopUser as any).profile_pic_url,
                role: role,
                lastSync: new Date()
            },
            { upsert: true, new: true }
        );

        res.json(user);
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Internal server error during sync' });
    }
});

// Get current user info
router.get('/me', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findOne({ whopUserId: req.user!.whopUserId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
