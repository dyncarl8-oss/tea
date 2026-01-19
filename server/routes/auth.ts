
import express from 'express';
import WhopSDK from '@whop/sdk';
import User from '../models/User.js';
import { validateWhopToken } from '../middleware/auth.js';

const router = express.Router();
const sdk = new WhopSDK.Whop({ apiKey: process.env.WHOP_API_KEY });
const COMPANY_ID = process.env.WHOP_COMPANY_ID;

// Use explicit type casting for Whop User object to avoid TS errors on dynamic properties
interface WhopUserResponse {
    username: string;
    email?: string;
    profile_pic_url?: string;
    avatar_url?: string;
    is_admin?: boolean;
}

router.post('/login', validateWhopToken, async (req, res) => {
    try {
        const whopUserId = req.user?.whopUserId;

        if (!whopUserId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }

        // 1. Fetch User Info - Support both string and object signatures to be safe with SDK versions
        let whopUser: WhopUserResponse;
        try {
            whopUser = (await sdk.users.retrieve(whopUserId)) as any;
        } catch (e) {
            whopUser = (await (sdk.users as any).retrieve({ userId: whopUserId })) as any;
        }

        // 2. Identify Role using checkAccess
        let role: 'guest' | 'member' | 'affiliate' | 'admin' = 'guest';

        if (COMPANY_ID) {
            try {
                const access = await sdk.users.checkAccess(COMPANY_ID, { id: whopUserId });
                if (access.access_level === 'admin') {
                    role = 'admin';
                } else if (access.access_level === 'customer' || access.has_access) {
                    role = 'member';
                }
            } catch (e) {
                console.error('Access check failed:', e);
            }
        }

        // 3. Fallback for Admin role if checkAccess skipped/failed
        if (role === 'guest' && whopUser.is_admin) {
            role = 'admin';
        }

        // 4. Update or Create Local User
        const user = await User.findOneAndUpdate(
            { whopUserId },
            {
                username: whopUser.username || 'Tribal Member',
                email: whopUser.email,
                avatarUrl: whopUser.profile_pic_url || whopUser.avatar_url,
                role: role,
                lastSync: new Date()
            },
            { upsert: true, new: true }
        );

        res.json(user);
    } catch (error) {
        console.error('Auth sync error:', error);
        res.status(500).json({ error: 'Failed to sync with Whop' });
    }
});

router.get('/me', validateWhopToken, async (req, res) => {
    try {
        const whopUserId = req.user?.whopUserId;
        const user = await User.findOne({ whopUserId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
