
import express from 'express';
import WhopSDK from '@whop/sdk';
import User from '../models/User.js';
import { validateWhopToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
const sdk = new WhopSDK.Whop({ apiKey: process.env.WHOP_API_KEY });
const COMPANY_ID = process.env.WHOP_COMPANY_ID; // Should be set in Render

router.post('/login', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const { whopUserId } = req.user!;

        // 1. Fetch Basic User Info
        const whopUser = await sdk.users.retrieve(whopUserId);

        // 2. Identify Role using checkAccess
        // We prioritize Admin status first, then Member status
        let role: 'guest' | 'member' | 'affiliate' | 'admin' = 'guest';

        try {
            // Check if user is an admin of the company
            if (COMPANY_ID) {
                const access = await sdk.users.checkAccess(COMPANY_ID, { id: whopUserId });
                if (access.access_level === 'admin') {
                    role = 'admin';
                } else if (access.access_level === 'customer' || access.has_access) {
                    role = 'member';
                }
            } else {
                console.warn('WHOP_COMPANY_ID not set. Basic role detection fallback active.');
                // Fallback: If retrieve returns is_admin (depends on SDK/Privileges)
                if ((whopUser as any).is_admin) role = 'admin';
            }
        } catch (e) {
            console.error('Access check failed:', e);
        }

        // 3. Sync with Local DB
        const user = await User.findOneAndUpdate(
            { whopUserId },
            {
                username: whopUser.username || 'Tribal Member',
                email: whopUser.email,
                avatarUrl: (whopUser as any).profile_pic_url || (whopUser as any).avatar_url,
                role: role,
                lastSync: new Date()
            },
            { upsert: true, new: true }
        );

        res.json(user);
    } catch (error) {
        console.error('Sync process failed:', error);
        res.status(500).json({ error: 'Failed to synchronize with Whop profile.' });
    }
});

router.get('/me', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findOne({ whopUserId: req.user!.whopUserId });
        if (!user) return res.status(404).json({ error: 'Session not found. Please re-authenticate.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Retrieval failed.' });
    }
});

export default router;
