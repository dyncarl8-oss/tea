
import { Request, Response, NextFunction } from 'express';
import WhopSDK from '@whop/sdk';

const WHOP_API_KEY = process.env.WHOP_API_KEY;

if (!WHOP_API_KEY) {
    console.error('CRITICAL: WHOP_API_KEY is not set in environment variables.');
}

const sdk = new WhopSDK.Whop({ apiKey: WHOP_API_KEY || '' });

export interface AuthRequest extends Request {
    user?: {
        whopUserId: string;
    };
}

/**
 * Validates the Whop user token passed from the frontend iFrame/URL.
 * Uses the official verifyUserToken method which expects headers.
 */
export const validateWhopToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['x-whop-user-token'] as string;

    if (!token) {
        console.warn('Auth Failure: Missing x-whop-user-token header');
        return res.status(401).json({ error: 'Authentication required. Please access via Whop.' });
    }

    try {
        // According to Whop docs, verifyUserToken takes the headers object
        const verification = await sdk.verifyUserToken(req.headers as any);

        if (!verification || !verification.userId) {
            return res.status(401).json({ error: 'Invalid or expired Whop token.' });
        }

        req.user = { whopUserId: verification.userId };
        next();
    } catch (error) {
        console.error('Whop Token Verification Exception:', error);
        return res.status(401).json({ error: 'Token validation failed. Please refresh Whop.' });
    }
};
