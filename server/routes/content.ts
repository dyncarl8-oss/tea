
import express from 'express';
import { Course } from '../models/Content.js';
import { AuthRequest, validateWhopToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/content/courses', validateWhopToken, async (req: AuthRequest, res) => {
    try {
        // In real app, check req.user.role to unlock
        const courses = await Course.find();
        // Transform to add 'locked' status based on role
        const userRole = req.user?.whopUserId ? 'member' : 'guest'; // Simplified

        const mapped = courses.map(c => ({
            ...c.toObject(),
            locked: userRole === 'guest' // Example logic
        }));

        res.json(mapped);
    } catch (error) {
        res.json([]); // Return empty if fail/no db
    }
});

export default router;
