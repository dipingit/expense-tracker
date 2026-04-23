import express from 'express';
import { createExpense, deleteExpense, getAllExpenses, getExpenseByID, updateExpense } from '../controller/expense.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createExpenseSchema, getExpenseByIDSchema } from '../utils/validation.schemas';
import { protect, validateBearerFormat } from '../middleware/auth.middleware';


const router = express.Router();

//create expense

router.post('/expenses', validateBearerFormat, protect, validateRequest(createExpenseSchema), createExpense);
router.get('/expenses', validateBearerFormat, protect, getAllExpenses);
router.get('/expenses/:id', validateBearerFormat, protect, validateRequest(getExpenseByIDSchema), getExpenseByID);
router.patch('/expenses/:id', validateBearerFormat, protect, validateRequest(createExpenseSchema), updateExpense);
router.delete('/expenses/:id', validateBearerFormat, protect, deleteExpense);

export default router;