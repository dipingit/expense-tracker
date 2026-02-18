import {z} from 'zod';

// ============== Expense Schema =================

//create expense
export const createExpenseSchema = z.object({
    body: z.object({
        amount: z.number().min(1, 'Amount must be greater than 0'),
        description: z.string().optional(),
        categoryId: z.number().int().min(1, 'Category ID is required'),
        userId: z.number().int().min(1, 'user id is required'),
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