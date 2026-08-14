import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    calculateSpendingTrend,
    computeSpendingStats,
    findUnusualExpense,
} from '../utils/spending.utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const getAIInsights = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const monthParam = Array.isArray(req.query.month) 
            ? (req.query.month[0] as string)
            : (typeof req.query.month === 'string' ? req.query.month : '0');
        const yearParam = Array.isArray(req.query.year) 
            ? (req.query.year[0] as string)
            : (typeof req.query.year === 'string' ? req.query.year : '0');
        const month = parseInt(monthParam) || new Date().getMonth();
        const year = parseInt(yearParam) || new Date().getFullYear();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const expenses = await prisma.expense.findMany({
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

        if (expenses.length === 0) {
            return res.status(200).json({
                data: {
                    spendingTrend: { trend: 'no_data', percentage: 0 },
                    topCategory: null,
                    unusualExpense: null,
                    monthlySummary: "No expenses recorded for this month."
                }
            });
        }
        const spendingTrend = await calculateSpendingTrend(userId, month, year);
        const categoryMap = new Map<string, number>();
        expenses.forEach((exp) => {

            const catName = exp.category.name;
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(exp.amount));

        });
        const topCategory = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])[0] || null;
        const unusualExpense = findUnusualExpense(expenses);

        const amounts = expenses.map((e) => Number(e.amount));

        const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0);

        const expenseStats = computeSpendingStats(amounts);

        const avgExpense = expenseStats ? Math.round(expenseStats.average) : 0;

        const maxExpense = expenseStats ? expenseStats.highest : 0;
        
        const prompt = `Analyze this monthly expense data and provide 3 key insights as a bullet point list (max 150 words total):

Total Spent: $${Math.round(totalSpent)}
Number of Transactions: ${expenses.length}
Average Expense: $${avgExpense}
Highest Expense: $${maxExpense}
Top Category: ${topCategory?.[0] || 'N/A'} ($${Math.round(topCategory?.[1] || 0)})
Spending Trend: ${spendingTrend.trend === 'increase' ? `↑ ${spendingTrend.percentage}% increase` : spendingTrend.trend === 'decrease' ? `↓ ${Math.abs(spendingTrend.percentage)}% decrease` : 'stable'}
${unusualExpense ? `Unusual Expense: ${unusualExpense.description || 'Unnamed'} - $${unusualExpense.amount} (${unusualExpense.category.name})` : ''}

Return ONLY a bulleted list with "• " prefix for each point. No markdown formatting. Be concise and actionable.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const result = await model.generateContent(prompt);
        const monthlySummary = result.response.text();
        res.status(200).json({
            data: {
                spendingTrend: {
                    trend: spendingTrend.trend,
                    percentage: spendingTrend.percentage,
                    currentAmount: spendingTrend.currentAmount,
                    previousAmount: spendingTrend.previousAmount
                },
                topCategory: topCategory ? {
                    name: topCategory[0],
                    amount: Math.round(topCategory[1] * 100) / 100
                } : null,
                unusualExpense: unusualExpense ? {
                    description: unusualExpense.description || 'Unnamed Transaction',
                    amount: unusualExpense.amount,
                    category: unusualExpense.category.name
                } : null,
                monthlySummary,
                month,
                year
            }
        });

    } catch (error: any) {
        console.error('AI Insights Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate insights' });
    }
};
