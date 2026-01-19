
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
    console.error('SERVER LOG ERROR: WHOP_API_KEY is null or undefined.');
}

const sdk = new WhopSDK.Whop({ apiKey: WHOP_API_KEY || 'missing_key' });

/**
 * Hyper-Verbose Whop Token Validation.
 * Logs specifically for the Render console.
 */
export const validateWhopToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-whop-user-token'] as string;

    // SERVER LOG: Header Inspection
    console.log('--- WHOP AUTH ATTEMPT ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Path:', req.path);
    console.log('Headers:', JSON.stringify({
        ...req.headers,
        'x-whop-user-token': token ? `PRESENT (${token.length} chars)` : 'MISSING'
    }, null, 2));

    if (!token) {
        console.warn('SERVER LOG: Blocking request - No x-whop-user-token provided.');
        return res.status(401).json({ error: 'Identity required. Please access via Whop.' });
    }

    try {
        console.log('SERVER LOG: Calling sdk.verifyUserToken...');
        const verification = await sdk.verifyUserToken(req.headers as any);

        if (!verification || !verification.userId) {
            console.error('SERVER LOG: Verification Payload INVALID:', JSON.stringify(verification));
            return res.status(401).json({ error: 'Whop token verification failed.' });
        }

        console.log('SERVER LOG: SUCCESS - Verified User ID:', verification.userId);
        req.user = { whopUserId: verification.userId };
        next();
    } catch (error: any) {
        console.error('SERVER LOG: EXCEPTION in verifyUserToken:', error.message || error);
        return res.status(401).json({ error: 'Identity validation exception.' });
    }
};
