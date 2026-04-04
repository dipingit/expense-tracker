import {z} from 'zod';


// ============ USER SCHEMAS ============
export const registerSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email address').transform((val) => val.toLowerCase()),
        name: z.string().optional(),
        password: z
            .string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const updateCurrentUserSchema = z.object({
    body: z.object({
        name: z.string().optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address').optional(),
        name: z.string().optional(),
    }),
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val)), {
            message: 'ID must be a valid number',
        }),
    }),
});

export const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val)), {
            message: 'ID must be a valid number',
        }),
    }),
});

export const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val)), {
            message: 'ID must be a valid number',
        }),
    }),
});
// ============== Expense Schema =================

//create expense
export const createExpenseSchema = z.object({
    body: z.object({
        amount: z.number().min(1, 'Amount must be greater than 0'),
        description: z.string().optional(),
        categoryId: z.number().int().min(1, 'Category ID is required')
    }),
    params: z.record(z.string(), z.string()).optional(),
    query: z.record(z.string(), z.string()).optional(),
});

export const getExpenseByIDSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => !isNaN(parseInt(val)),{
            message: "Id must be a valid number",
        }),
    }),
});

export type createExpenseSchema = z.infer<typeof createExpenseSchema>;