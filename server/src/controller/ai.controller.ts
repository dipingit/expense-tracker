import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to calculate spending trend
const calculateSpendingTrend = async (userId: number, currentMonth: number, currentYear: number) => {
    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    const previousStart = new Date(currentYear, currentMonth - 1, 1);
    const previousEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const currentSpending = await prisma.expense.aggregate({
        where: {
            userId,
            createdAt: { gte: currentStart, lte: currentEnd }
        },
        _sum: { amount: true }
    });

    const previousSpending = await prisma.expense.aggregate({
        where: {
            userId,
            createdAt: { gte: previousStart, lte: previousEnd }
        },
        _sum: { amount: true }
    });

    const current = currentSpending._sum.amount || 0;
    const previous = previousSpending._sum.amount || 0;

    let trend = 'stable';
    let percentage = 0;

    if (previous === 0) {
        trend = current > 0 ? 'increase' : 'stable';
    } else {
        percentage = Math.round(((current - previous) / previous) * 100);
        if (percentage > 5) {
            trend = 'increase';
        } else if (percentage < -5) {
            trend = 'decrease';
        }
    }

    return { trend, percentage, currentAmount: Math.round(current * 100) / 100, previousAmount: Math.round(previous * 100) / 100 };
};

// Get AI insights
export const getAIInsights = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const month = parseInt(String(req.query.month)) || new Date().getMonth();
        const year = parseInt(String(req.query.year)) || new Date().getFullYear();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // Get all expenses for the month
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

        // Calculate spending trend
        const spendingTrend = await calculateSpendingTrend(userId, month, year);

        // Find top category
        const categoryMap = new Map();
        expenses.forEach((exp: typeof expenses[0]) => {
            const catName = exp.category.name;
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(exp.amount));
        });
        const topCategory = Array.from(categoryMap.entries())
            .sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0] || null;

        // Find unusual expenses (outliers - above 75th percentile)
        const amounts = expenses.map((e: typeof expenses[0]) => Number(e.amount)).sort((a: number, b: number) => a - b);
        const q3Index = Math.ceil(amounts.length * 0.75) - 1;
        const q3 = amounts[q3Index];
        const iqr = q3 - amounts[Math.ceil(amounts.length * 0.25) - 1];
        const outlierThreshold = q3 + iqr;

        const unusualExpense = expenses.find((e: typeof expenses[0]) => Number(e.amount) > outlierThreshold);

        // Prepare data for Gemini
        const totalSpent = expenses.reduce((sum: number, e: typeof expenses[0]) => sum + Number(e.amount), 0);
        const avgExpense = Math.round(totalSpent / expenses.length);
        const maxExpense = Math.max(...amounts);

        const prompt = `Analyze this monthly expense data and provide 2-3 brief insights (max 150 words total):
        
Total Spent: $${Math.round(totalSpent)}
Number of Transactions: ${expenses.length}
Average Expense: $${avgExpense}
Highest Expense: $${maxExpense}
Top Category: ${topCategory?.[0] || 'N/A'} ($${Math.round(topCategory?.[1] || 0)})
Spending Trend: ${spendingTrend.trend === 'increase' ? `↑ ${spendingTrend.percentage}% increase` : spendingTrend.trend === 'decrease' ? `↓ ${Math.abs(spendingTrend.percentage)}% decrease` : 'stable'}
${unusualExpense ? `Unusual Expense: ${unusualExpense.description || 'Unnamed'} - $${unusualExpense.amount} (${unusualExpense.category.name})` : ''}

Provide actionable, friendly advice based on this data. Be concise and encouraging.`;

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
