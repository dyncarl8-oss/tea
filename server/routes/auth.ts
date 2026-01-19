
import express from 'express';
import User from '../models/User.js';
import { validateWhopToken, AuthRequest } from '../middleware/auth.js';
import WhopSDK from '@whop/sdk';

const router = express.Router();
const sdk = new WhopSDK({ apiKey: process.env.WHOP_API_KEY || '' });

// POST /api/auth/login
// Called by frontend on load to sync user info
router.post('/login', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const { whopUserId } = req.user!;

        // Fetch latest user info from Whop API
        const whopUser = await sdk.users.retrieve(whopUserId) as any;

        // Find or Create user in our DB
        let user = await User.findOne({ whopUserId });

        if (!user) {
            user = new User({
                whopUserId,
                username: whopUser.username || 'Unknown',
                email: whopUser.email,
                avatar: whopUser.profile_pic_url || '',
                role: 'member' // Default role
            });
        } else {
            // Update info
            user.username = whopUser.username || user.username;
            user.email = whopUser.email || user.email;
            user.avatar = whopUser.profile_pic_url || user.avatar;
        }

        await user.save();

        res.json({ user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me
router.get('/me', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findOne({ whopUserId: req.user!.whopUserId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
