import express from 'express';
import { createExpense, getAllExpenses, getExpenseByID } from '../controller/expense.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createExpenseSchema, getExpenseByIDSchema } from '../utils/validation.schemas';


const router = express.Router();

//create expense

router.post('/expenses', validateRequest(createExpenseSchema), createExpense);
router.get('/expenses', getAllExpenses);
router.get('/expenses/:id', validateRequest(getExpenseByIDSchema), getExpenseByID);

export default router;