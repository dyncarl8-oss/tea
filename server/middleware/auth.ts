
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
    console.error('CRITICAL ERROR: WHOP_API_KEY is not set in environment variables.');
}

const sdk = new WhopSDK.Whop({ apiKey: WHOP_API_KEY || 'missing_key' });

/**
 * Validates the Whop user token.
 * Added deep instrumentation to trace identity flow on Render.
 */
export const validateWhopToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-whop-user-token'] as string;

    // LOG 1: Raw Header Trace (Masked)
    if (token) {
        console.log(`[AUTH TRACE] Token Header Detected: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
    } else {
        console.warn('[AUTH TRACE] x-whop-user-token header is MISSING');
    }

    if (!token) {
        return res.status(401).json({ error: 'Identity required. Access via Whop Hub.' });
    }

    try {
        console.log('[AUTH TRACE] Attempting verifyUserToken...');
        const verification = await sdk.verifyUserToken(req.headers as any);

        if (!verification || !verification.userId) {
            console.error('[AUTH TRACE] Verification failed: No userId in payload', verification);
            return res.status(401).json({ error: 'Whop identity verification failed.' });
        }

        console.log(`[AUTH TRACE] SUCCESS: Verified User ID: ${verification.userId}`);
        req.user = { whopUserId: verification.userId };
        next();
    } catch (error: any) {
        console.error('[AUTH TRACE] EXCEPTION during verification:', error.message || error);
        return res.status(401).json({ error: 'Token validation exception.' });
    }
};
