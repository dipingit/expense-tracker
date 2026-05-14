import express from 'express';
import { createExpense, deleteExpense, getAllExpenses, getExpenseByID, updateExpense, getDashboardSummary, getYearlySummary } from '../controller/expense.controller';
import { getAIInsights } from '../controller/ai.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createExpenseSchema, getExpenseByIDSchema, updateExpenseSchema } from '../utils/validation.schemas';
import { protect, validateBearerFormat } from '../middleware/auth.middleware';


const router = express.Router();

//create expense
router.post('/expenses', validateBearerFormat, protect, validateRequest(createExpenseSchema), createExpense);

//get all expenses with pagination
router.get('/expenses', validateBearerFormat, protect, getAllExpenses);

//get expense by ID
router.get('/expenses/:id', validateBearerFormat, protect, validateRequest(getExpenseByIDSchema), getExpenseByID);

//update expense
router.patch('/expenses/:id', validateBearerFormat, protect, validateRequest(updateExpenseSchema), updateExpense);

//delete expense
router.delete('/expenses/:id', validateBearerFormat, protect, deleteExpense);

//get dashboard summary
router.get('/dashboard/summary', validateBearerFormat, protect, getDashboardSummary);

//get yearly summary
router.get('/dashboard/yearly-summary', validateBearerFormat, protect, getYearlySummary);

//get AI insights
router.get('/dashboard/ai-insights', validateBearerFormat, protect, getAIInsights);

export default router;