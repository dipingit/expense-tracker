import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
import api from "../api/axios";

interface AIInsightsData {
    spendingTrend: {
        trend: 'increase' | 'decrease' | 'stable' | 'no_data';
        percentage: number;
        currentAmount?: number;
        previousAmount?: number;
    };
    topCategory: {
        name: string;
        amount: number;
    } | null;
    unusualExpense: {
        description: string;
        amount: number;
        category: string;
    } | null;
    monthlySummary: string;
    month: number;
    year: number;
}

interface AIInsightsProps {
    refreshTrigger?: number;
}

const AIInsights = ({ refreshTrigger = 0 }: AIInsightsProps) => {
    const [insights, setInsights] = useState<AIInsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();

                const response = await api.get(`/dashboard/ai-insights?month=${month}&year=${year}`);
                setInsights(response.data.data);
                setError(null);
            } catch (err: any) {
                setError("Failed to load insights");
                console.error("Error fetching AI insights:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={20} />
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                </div>
                <div className="h-24 bg-white/10 rounded"></div>
            </div>
        );
    }

    if (error || !insights) {
        return (
            <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error || "Unable to load insights"}</span>
                </div>
            </div>
        );
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[insights.month];

    return (
        <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={24} className="text-yellow-300" />
                <div>
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                    <p className="text-xs opacity-75">{monthName} {insights.year}</p>
                </div>
            </div>

            {/* Insights Grid */}
            <div className="space-y-4">
                {/* Spending Trend */}
                {insights.spendingTrend.trend !== 'no_data' && (
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            {insights.spendingTrend.trend === 'increase' ? (
                                <>
                                    <TrendingUp size={18} className="text-red-300" />
                                    <span className="font-semibold">Spending Increase</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown size={18} className="text-green-300" />
                                    <span className="font-semibold">Spending Decrease</span>
                                </>
                            )}
                        </div>
                        <p className="text-sm opacity-90">
                            ✔ {Math.abs(insights.spendingTrend.percentage)}% {insights.spendingTrend.trend === 'increase' ? 'higher' : 'lower'} than last month
                            {insights.spendingTrend.currentAmount && (
                                <>
                                    <br />
                                    <span className="text-xs opacity-75">
                                        ${insights.spendingTrend.previousAmount?.toFixed(2)} → ${insights.spendingTrend.currentAmount.toFixed(2)}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                )}

                {/* Top Category */}
                {insights.topCategory && (
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📊</span>
                            <span className="font-semibold">Top Category</span>
                        </div>
                        <p className="text-sm opacity-90">
                            ✔ <span className="font-medium">{insights.topCategory.name}</span> - ${insights.topCategory.amount.toFixed(2)} spent
                        </p>
                    </div>
                )}

                {/* Unusual Expense */}
                {insights.unusualExpense && (
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border-l-2 border-yellow-300">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={18} className="text-yellow-300" />
                            <span className="font-semibold">Unusual Expense Detected</span>
                        </div>
                        <p className="text-sm opacity-90">
                            ✔ <span className="font-medium">{insights.unusualExpense.description}</span> - ${insights.unusualExpense.amount.toFixed(2)} ({insights.unusualExpense.category})
                        </p>
                    </div>
                )}

                {/* Monthly Summary */}
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💡</span>
                        <span className="font-semibold">Monthly Summary</span>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">
                        {insights.monthlySummary}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
