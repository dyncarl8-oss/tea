
import { Request, Response, NextFunction } from 'express';
import WhopSDK from '@whop/sdk';

const WHOP_API_KEY = process.env.WHOP_API_KEY;

if (!WHOP_API_KEY) {
    console.warn('WHOP_API_KEY is not set. Whop validation will fail.');
}

const sdk = new WhopSDK({ apiKey: WHOP_API_KEY || 'dummy' });

export interface AuthRequest extends Request {
    user?: {
        whopUserId: string;
        // Add other fields as needed
    };
}

export const validateWhopToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['x-whop-user-token'] as string;

    if (!token) {
        // If no token, check if we are in dev mode or allow guest?
        // For now, we return 401, frontend should handle it.
        res.status(401).json({ error: 'Whop token not found' });
        return;
    }

    try {
        // Whop SDK to verify token
        // The verifyUserToken method returns the user ID if valid
        // Verify using the request object (SDK likely extracts header)
        const payload = await sdk.verifyUserToken({ headers: req.headers } as any);
        const p = payload as any;
        const userId = p.sub || p.id || p.user_id;

        if (!userId) {
            res.status(401).json({ error: 'Invalid Whop token payload' });
            return;
        }

        req.user = { whopUserId: userId };
        next();
    } catch (error) {
        console.error('Whop Token Validation Error:', error);
        res.status(401).json({ error: 'Token validation failed' });
    }
};
