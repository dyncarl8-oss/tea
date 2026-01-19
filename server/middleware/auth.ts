
import { Request, Response, NextFunction } from 'express';
import WhopSDK from '@whop/sdk';

// Augment Express Request type globally
declare global {
    namespace Express {
        interface Request {
            user?: {
                whopUserId: string;
            };
        }
    }
}

const WHOP_API_KEY = process.env.WHOP_API_KEY;

if (!WHOP_API_KEY) {
    console.error('CRITICAL: WHOP_API_KEY is not set in environment variables.');
}

const sdk = new WhopSDK.Whop({ apiKey: WHOP_API_KEY || 'missing_key' });

/**
 * Validates the Whop user token.
 * Augments req.user with the verified Whop User ID.
 */
export const validateWhopToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-whop-user-token'] as string;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required. Please access via Whop.' });
    }

    try {
        const verification = await sdk.verifyUserToken(req.headers as any);

        if (!verification || !verification.userId) {
            return res.status(401).json({ error: 'Invalid Whop token payload.' });
        }

        req.user = { whopUserId: verification.userId };
        next();
    } catch (error) {
        console.error('Whop Verification Error:', error);
        return res.status(401).json({ error: 'Token validation failed.' });
    }
};
