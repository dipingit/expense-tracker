import {Request, Response, NextFunction} from 'express';
import {ZodSchema} from 'zod';
import {z} from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = (await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query,
            })) as { body: any; params: any; query: any };

            // Attach validated body to request (query and params are read-only)
            req.body = validated.body;

            next();
        } catch (error: any) {
            console.error('Validation error:', error);
            
            const errors = error.errors?.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
            })) || [];

            res.status(400).json({
                error: 'Validation failed',
                details: errors.length > 0 ? errors : [{ message: error.message }],
            });
        }
    };
};

