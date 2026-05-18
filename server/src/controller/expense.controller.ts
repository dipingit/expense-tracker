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

//get all expenses with pagination
export const getAllExpenses = async(req: Request, res: Response) => {
    try{
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const pageParam = Array.isArray(req.query.page) 
            ? (req.query.page[0] as string)
            : (typeof req.query.page === 'string' ? req.query.page : '1');
        const limitParam = Array.isArray(req.query.limit) 
            ? (req.query.limit[0] as string)
            : (typeof req.query.limit === 'string' ? req.query.limit : '10');
        const page = Math.max(1, parseInt(pageParam) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(limitParam) || 10));
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalExpenses = await prisma.expense.count({
            where: { userId: userId }
        });

        const expenses = await prisma.expense.findMany({
            where: { userId: userId },
            orderBy: {
                createdAt: 'desc',
            },
            include:{
                category: true
            },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(totalExpenses / limit);

        res.status(200).json({
            data: expenses,
            pagination: {
                page,
                limit,
                totalExpenses,
                totalPages
            }
        });
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
        
        // Build update data object - only include fields that are provided
        const updateData: any = {};
        
        if (amount !== undefined) {
            updateData.amount = parseFloat(amount);
        }
        if (description !== undefined) {
            updateData.description = description || null;
        }
        if (categoryId !== undefined) {
            updateData.categoryId = categoryId;
        }
        
        // Check if at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({error: 'No fields to update'});
        }
        
        // Update the expense
        const updatedExpense = await prisma.expense.update({
            where: { id: parseInt(id), userId: userId },
            data: updateData,
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

//get dashboard summary
export const getDashboardSummary = async(req: Request, res: Response) => {
    try{
        const userId = req.userId;
        if(!userId) return res.status(401).json({error: "Unauthorized"});

        const monthParam = Array.isArray(req.query.month) 
            ? (req.query.month[0] as string)
            : (typeof req.query.month === 'string' ? req.query.month : '0');
        const yearParam = Array.isArray(req.query.year) 
            ? (req.query.year[0] as string)
            : (typeof req.query.year === 'string' ? req.query.year : '0');
        const month = parseInt(monthParam) || new Date().getMonth();
        const year = parseInt(yearParam) || new Date().getFullYear();

        // Get start and end date of the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // Get all expenses for the month
        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                userId: userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                category: true
            }
        });

        // Calculate summary statistics
        const totalExpense = monthlyExpenses.reduce((sum: number, expense: typeof monthlyExpenses[0]) => sum + Number(expense.amount), 0);
        const numberOfTransactions = monthlyExpenses.length;
        const averageExpense = numberOfTransactions > 0 ? Math.round(totalExpense / numberOfTransactions) : 0;
        const highestExpense = monthlyExpenses.length > 0 
            ? Math.max(...monthlyExpenses.map((e: typeof monthlyExpenses[0]) => Number(e.amount))) 
            : 0;

        // Calculate category distribution
        const categoryMap = new Map();
        monthlyExpenses.forEach((expense: typeof monthlyExpenses[0]) => {
            const categoryName = expense.category.name;
            const currentTotal = categoryMap.get(categoryName) || 0;
            categoryMap.set(categoryName, currentTotal + Number(expense.amount));
        });

        const categoryDistribution = Array.from(categoryMap, ([category, total]: [string, number]) => ({
            category,
            total: Math.round(total)
        })).sort((a: { category: string; total: number }, b: { category: string; total: number }) => b.total - a.total);

        res.status(200).json({
            data: {
                totalExpense: Math.round(totalExpense),
                averageExpense,
                highestExpense: Math.round(highestExpense),
                numberOfTransactions,
                categoryDistribution,
                month,
                year
            }
        });
    }catch(error: any){
        res.status(500).json({error: error.message});
    }
}

//get yearly summary for 12 months
export const getYearlySummary = async(req: Request, res: Response) => {
    try{
        const userId = req.userId;
        if(!userId) return res.status(401).json({error: "Unauthorized"});

        const yearParam = Array.isArray(req.query.year) 
            ? (req.query.year[0] as string)
            : (typeof req.query.year === 'string' ? req.query.year : '0');
        const year = parseInt(yearParam) || new Date().getFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const monthlyData = await Promise.all(
            months.map(async (_: string, monthIndex: number) => {
                const startDate = new Date(year, monthIndex, 1);
                const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

                const expenses = await prisma.expense.findMany({
                    where: {
                        userId: userId,
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });

                const spending = expenses.reduce((sum: number, expense: typeof expenses[0]) => sum + Number(expense.amount), 0);

                return {
                    month: months[monthIndex],
                    spending: Math.round(spending * 100) / 100
                };
            })
        );

        res.status(200).json({
            data: monthlyData,
            year
        });
    }catch(error: any){
        res.status(500).json({error: error.message});
    }
}