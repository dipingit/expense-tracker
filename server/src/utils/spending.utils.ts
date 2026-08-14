import { prisma } from '../prisma';

export const MIN_HISTORY_FOR_OUTLIER = 5;

export interface CategorySpendingStats {
    average: number;
    highest: number;
    count: number;
    q1: number;
    q3: number;
    iqr: number;
}

export interface OutlierCheckResult {
    isOutlier: boolean;
    message: string | null;
    stats: CategorySpendingStats | null;
}

export interface SpendingTrend {
    trend: 'stable' | 'increase' | 'decrease' | 'no_data';
    percentage: number;
    currentAmount: number;
    previousAmount: number;
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const percentile = (sorted: number[], percentileValue: number) => {
    const index = Math.ceil(sorted.length * percentileValue) - 1;
    return sorted[Math.max(0, index)];
};

export const computeSpendingStats = (amounts: number[]): CategorySpendingStats | null => {
    if (amounts.length === 0) return null;

    const sorted = [...amounts].sort((a, b) => a - b);
    const total = sorted.reduce((sum, amount) => sum + amount, 0);
    const q1 = percentile(sorted, 0.25);
    const q3 = percentile(sorted, 0.75);

    return {
        average: roundCurrency(total / sorted.length),
        highest: sorted[sorted.length - 1],
        count: sorted.length,
        q1,
        q3,
        iqr: q3 - q1,
    };
};

export const getIqrOutlierThreshold = (stats: CategorySpendingStats) =>
    stats.q3 + 1.5 * stats.iqr;

export const isAmountOutlier = (amount: number, stats: CategorySpendingStats): boolean => {
    if (stats.count < MIN_HISTORY_FOR_OUTLIER) return false;

    const iqrThreshold = getIqrOutlierThreshold(stats);
    return amount > stats.highest * 2 || amount > stats.average * 3 || amount > iqrThreshold;
};

export const buildOutlierMessage = (categoryName: string, stats: CategorySpendingStats): string =>
    `This amount is significantly higher than your usual ${categoryName.toLowerCase()} expenses.`;

export const checkAmountOutlier = (
    amount: number,
    stats: CategorySpendingStats | null,
    categoryName: string
): OutlierCheckResult => {
    if (!stats || stats.count < MIN_HISTORY_FOR_OUTLIER) {
        return { isOutlier: false, message: null, stats };
    }

    const isOutlier = isAmountOutlier(amount, stats);
    return {
        isOutlier,
        message: isOutlier ? buildOutlierMessage(categoryName, stats) : null,
        stats,
    };
};

export const findUnusualExpense = <T extends { amount: number | string | { toString(): string } }>(
    expenses: T[]
): T | null => {
    const amounts = expenses.map((expense) => Number(expense.amount));
    const stats = computeSpendingStats(amounts);
    if (!stats || stats.count < MIN_HISTORY_FOR_OUTLIER) return null;

    const threshold = getIqrOutlierThreshold(stats);
    return expenses.find((expense) => Number(expense.amount) > threshold) ?? null;
};

export const calculateSpendingTrend = async (
    userId: number,
    currentMonth: number,
    currentYear: number
): Promise<SpendingTrend> => {
    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const previousStart = new Date(currentYear, currentMonth - 1, 1);
    const previousEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const [currentSpending, previousSpending] = await Promise.all([
        prisma.expense.aggregate({
            where: { userId, createdAt: { gte: currentStart, lte: currentEnd } },
            _sum: { amount: true },
        }),
        prisma.expense.aggregate({
            where: { userId, createdAt: { gte: previousStart, lte: previousEnd } },
            _sum: { amount: true },
        }),
    ]);

    const current = currentSpending._sum.amount || 0;
    const previous = previousSpending._sum.amount || 0;

    let trend: SpendingTrend['trend'] = 'stable';
    let percentage = 0;

    if (previous === 0) {
        trend = current > 0 ? 'increase' : 'stable';
    } else {
        percentage = Math.round(((current - previous) / previous) * 100);
        if (percentage > 5) trend = 'increase';
        else if (percentage < -5) trend = 'decrease';
    }

    return {
        trend,
        percentage,
        currentAmount: roundCurrency(current),
        previousAmount: roundCurrency(previous),
    };
};

export const getCategorySpendingHistory = async (userId: number, categoryId: number) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return prisma.expense.findMany({
        where: {
            userId,
            categoryId,
            createdAt: { gte: sixMonthsAgo },
        },
        select: { amount: true },
    });
};
