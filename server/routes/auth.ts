
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
        console.log('--- TRIBAL SYNC START ---');
        console.log('Syncing identity for Whop UID:', whopUserId);

        if (!whopUserId) {
            console.error('SERVER LOG: No whopUserId available in request.');
            return res.status(401).json({ error: 'User ID missing' });
        }

        // 1. Profile Retrieval
        let whopUser: WhopUserResponse;
        try {
            console.log('SERVER LOG: Retrieving profile from Whop...');
            whopUser = (await sdk.users.retrieve(whopUserId)) as any;
            console.log('SERVER LOG: Profile found for @', whopUser.username);
        } catch (e: any) {
            console.warn('SERVER LOG: Standard retrieval failed, attempting legacy fix...');
            whopUser = (await (sdk.users as any).retrieve({ userId: whopUserId })) as any;
        }

        // 2. Role Gating via checkAccess
        let role: 'guest' | 'member' | 'affiliate' | 'admin' = 'guest';

        if (COMPANY_ID) {
            console.log('SERVER LOG: Validating access against Company:', COMPANY_ID);
            try {
                const access = await sdk.users.checkAccess(COMPANY_ID, { id: whopUserId });
                console.log('SERVER LOG: checkAccess Result -> Level:', access.access_level, '| Has Access:', access.has_access);

                if (access.access_level === 'admin') {
                    role = 'admin';
                } else if (access.access_level === 'customer' || access.has_access) {
                    role = 'member';
                }
            } catch (e: any) {
                console.error('SERVER LOG: checkAccess API Error:', e.message);
            }
        } else {
            console.warn('SERVER LOG: WHOP_COMPANY_ID is NULL. Defaulting to fallback role detection.');
            if (whopUser.is_admin) role = 'admin';
        }

        console.log('SERVER LOG: Synchronizing database with role:', role);

        // 3. Database Upsert
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

        console.log('SERVER LOG: Identity Synchronized Successfully.');
        console.log('--- TRIBAL SYNC END ---');

        res.json(user);
    } catch (error: any) {
        console.error('SERVER LOG: CRITICAL FAIL in /login sync:', error.message);
        res.status(500).json({ error: 'Profile synchronization failed' });
    }
});

router.get('/me', validateWhopToken, async (req, res) => {
    try {
        const whopUserId = req.user?.whopUserId;
        const user = await User.findOne({ whopUserId });
        if (!user) {
            console.warn('SERVER LOG: No local session for verified UID:', whopUserId);
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Retrieval failed' });
    }
});

export default router;
