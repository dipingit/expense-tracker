import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.utils';

//extended express request with user context
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userEmail?: string;
        }
    }
}

/**
 * Protect routes - Verify access token
 * Middleware to verify JWT access token and attach user to request
 */
export const protect = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided. Please login first.',
            });
            return;
        }

        // verify access token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token. Please login again.',
            });
            return;
        }

        // attach user context to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Token verification failed',
        });
    }
};

/**
 * Validate Bearer token format
 * Helper middleware to ensure proper Authorization header format
 */
export const validateBearerFormat = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Authorization header must use Bearer scheme. Format: Bearer <token>',
        });
        
    }

    next();
};
