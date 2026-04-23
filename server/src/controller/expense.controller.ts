import {Request, Response} from 'express';
import {prisma} from '../prisma';

//Create - Add a new expense
export const createExpense = async(req: Request, res: Response) => {
    try{
        const userId = req.userId; // From auth middleware
        if (!userId) {
            return res.status(401).json({ error: "User context missing" });
        }
        
        const {amount, description, categoryId} = req.body;
        
        const expense = await prisma.expense.create({
            data:{
                amount,
                description: description || null,
                categoryId,
                userId
            },
            include: {
                category: true,
            },
        });
        res.status(201).json({message: 'Expense created successfully!', data: expense});
    } catch(error: any){
        if(error.code === 'P2003'){
            return res.status(404).json({error: 'Category or User not found'});
        }
        res.status(500).json({error: error.message});
    }
}

//get all expenses
export const getAllExpenses = async(req: Request, res: Response) => {
    try{

        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const expenses = await prisma.expense.findMany({
            where: { userId: userId },
            orderBy: {
                createdAt: 'desc', // sort for the recent transactions
            },
            include:{
                category: true
            }
        });
        res.status(200).json({data: expenses});
    }
    catch(error: any){
        res.status(500).json({error: error.message});
    }
}
//get expense by ID
export const getExpenseByID = async(req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const expense = await prisma.expense.findFirst({
            where: { id: parseInt(id), userId: userId },
            include:{
                category: true,
            }
        });
        if(!expense){
            return res.status(404).json({error: 'Expense not found'});
        }
        return res.status(200).json({data: expense});
    }catch(error: any){
        res.status(500).json({error: error.message});
    }
}

//update expense
export const updateExpense = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const userId = req.userId;
        if(!userId) return res.status(401).json({error: "Unauthorized"});
        const {amount, description, categoryId} = req.body;
        
        // Update the expense
        const updatedExpense = await prisma.expense.update({
            where: { id: parseInt(id), userId: userId },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                description: description || null,
                categoryId
            },
            include: {
                category: true
            }
        });
        
        res.status(200).json({message: "Expense updated successfully", data: updatedExpense});
    } catch (error: any) {
        if(error.code === 'P2003'){
            return res.status(404).json({error: 'Category not found'});
        }
        if(error.code === 'P2025'){
            return res.status(404).json({error: 'Expense not found'});
        }
        res.status(500).json({error: error.message});
    }
}

//delete expense
export const deleteExpense = async(req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const userId = req.userId; 
        if(!userId) return res.status(401).json({error: "Unauthorized"});
        
        //check if expense exist
        const isExpenseExist = await prisma.expense.findFirst({
            where: {id: parseInt(id), userId: userId}
        });
        if(!isExpenseExist) return res.status(404).json({error: "expense not found"});
        
        await prisma.expense.delete({
            where: { id: parseInt(id), userId: userId }
        });
        
        res.status(200).json({message: "Expense deleted successfully"});
    }catch(error: any){
        if(error.code === 'P2025'){
            return res.status(404).json({error: "Expense not found"});
        }
        res.status(500).json({error: error.message});
    }
}