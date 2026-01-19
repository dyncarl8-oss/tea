
import express from 'express';
import WhopSDK from '@whop/sdk';
import User from '../models/User.js';
import { validateWhopToken } from '../middleware/auth.js';

const router = express.Router();
const sdk = new WhopSDK.Whop({ apiKey: process.env.WHOP_API_KEY });
const COMPANY_ID = process.env.WHOP_COMPANY_ID;

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
        console.log(`[SYNC TRACE] Starting sync for User: ${whopUserId}`);

        if (!whopUserId) {
            return res.status(401).json({ error: 'User ID missing' });
        }

        // 1. Fetch User Info
        let whopUser: WhopUserResponse;
        try {
            console.log('[SYNC TRACE] Fetching user profile from Whop...');
            whopUser = (await sdk.users.retrieve(whopUserId)) as any;
            console.log(`[SYNC TRACE] Profile retrieved: @${whopUser.username}`);
        } catch (e: any) {
            console.warn('[SYNC TRACE] Standard retrieve failed, trying fallback...', e.message);
            whopUser = (await (sdk.users as any).retrieve({ userId: whopUserId })) as any;
        }

        // 2. Role Detection with Diagnostics
        let role: 'guest' | 'member' | 'affiliate' | 'admin' = 'guest';

        if (COMPANY_ID) {
            console.log(`[SYNC TRACE] Checking access for Company: ${COMPANY_ID}`);
            try {
                const access = await sdk.users.checkAccess(COMPANY_ID, { id: whopUserId });
                console.log(`[SYNC TRACE] Access Level: ${access.access_level}, Has Access: ${access.has_access}`);

                if (access.access_level === 'admin') {
                    role = 'admin';
                } else if (access.access_level === 'customer' || access.has_access) {
                    role = 'member';
                }
            } catch (e: any) {
                console.error('[SYNC TRACE] checkAccess EXCEPTION:', e.message);
            }
        } else {
            console.warn('[SYNC TRACE] WHOP_COMPANY_ID is NOT DEFINED. Skipping deep role check.');
        }

        if (role === 'guest' && whopUser.is_admin) {
            console.log('[SYNC TRACE] Falling back to is_admin flat property for Admin role.');
            role = 'admin';
        }

        console.log(`[SYNC TRACE] FINAL DETERMINED ROLE: ${role}`);

        // 3. Database Sync
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
    } catch (error: any) {
        console.error('[SYNC TRACE] CRITICAL SYNC ERROR:', error.message);
        res.status(500).json({ error: 'Sync failed' });
    }
});

router.get('/me', validateWhopToken, async (req, res) => {
    try {
        const whopUserId = req.user?.whopUserId;
        const user = await User.findOne({ whopUserId });
        if (!user) {
            console.log(`[ME TRACE] Local session not found for ${whopUserId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

export default router;
