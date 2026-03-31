import {Request, Response, NextFunction} from 'express';
import {ZodSchema, ZodError} from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            }) as {body: any};

            // Attach validated body to request (only body is writable)
                req.body = validated.body;

            next();
        } catch (error: any) {
            // Check if error is a Zod error
            if (error instanceof ZodError) {
                const errors = error.issues.map((issue: any) => ({
                    field: issue.path.join('.') || 'unknown',
                    message: issue.message,
                }));

                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors,
                });
            }

            // Handle other errors
            res.status(400).json({
                error: 'Validation failed',
                details: [{ message: error.message || 'Unknown error' }],
            });
        }
    };
};

