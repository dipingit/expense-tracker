import {Request, Response} from 'express';
import {prisma} from '../prisma';

//Create - Add a new expense
export const createExpense = async(req: Request, res: Response) => {
    try{
        const {amount, description, categoryId, userId} = req.body;
        // const userId = req.userId; // From auth middleware
        
        const expense = await prisma.expense.create({
            data:{
                amount,
                description: description || null,
                categoryId,
                userId,   
            },
            include: {
                category: true,
                user: true,
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

export const getAllExpenses = async(req: Request, res: Response) => {
    try{

        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const expenses = await prisma.expense.findMany({
            where: { userId: userId },
            include:{
                user: true,
                category: true
            }
        });
        res.status(200).json({data: expenses});
    }
    catch(error: any){
        res.status(500).json({error: error.message});
    }
}
export const getExpenseByID = async(req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const expense = await prisma.expense.findFirst({
            where: { id: parseInt(id), userId: userId },
            include:{
                user: true,
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

