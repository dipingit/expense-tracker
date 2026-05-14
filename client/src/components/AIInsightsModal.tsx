import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, X } from "lucide-react";
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

interface AIInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Loader = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin opacity-75"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Lightbulb size={28} className="text-indigo-500 animate-pulse" />
            </div>
        </div>
        <p className="text-gray-600 font-medium">Analyzing your expenses...</p>
        <p className="text-gray-400 text-sm mt-2">Powered by Gemini AI</p>
    </div>
);

const AIInsightsModal = ({ isOpen, onClose }: AIInsightsModalProps) => {
    const [insights, setInsights] = useState<AIInsightsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setInsights(null);
            setError(null);
            return;
        }

        const fetchInsights = async () => {
            try {
                setLoading(true);
                setError(null);
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();

                const response = await api.get(`/dashboard/ai-insights?month=${month}&year=${year}`);
                setInsights(response.data.data);
            } catch (err: any) {
                setError("Failed to load insights. Please try again.");
                console.error("Error fetching AI insights:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                            <Lightbulb size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">AI Insights</h2>
                            {!loading && insights && (
                                <p className="text-sm text-gray-500">
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][insights.month]} {insights.year}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && <Loader />}

                    {error && !loading && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {insights && !loading && !error && (
                        <div className="space-y-4">
                            {/* Spending Trend */}
                            {insights.spendingTrend.trend !== 'no_data' && (
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        {insights.spendingTrend.trend === 'increase' ? (
                                            <>
                                                <div className="p-2 bg-red-100 rounded-lg">
                                                    <TrendingUp size={20} className="text-red-500" />
                                                </div>
                                                <span className="font-semibold text-gray-800">Spending Increase</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <TrendingDown size={20} className="text-green-500" />
                                                </div>
                                                <span className="font-semibold text-gray-800">Spending Decrease</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-gray-700">
                                        ✔ <span className="font-medium">{Math.abs(insights.spendingTrend.percentage)}%</span> {insights.spendingTrend.trend === 'increase' ? 'higher' : 'lower'} than last month
                                    </p>
                                    {insights.spendingTrend.currentAmount && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            ${insights.spendingTrend.previousAmount?.toFixed(2)} → ${insights.spendingTrend.currentAmount.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Top Category */}
                            {insights.topCategory && (
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <span className="text-xl">📊</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">Top Category</span>
                                    </div>
                                    <p className="text-gray-700">
                                        ✔ <span className="font-medium">{insights.topCategory.name}</span> - ${insights.topCategory.amount.toFixed(2)}
                                    </p>
                                </div>
                            )}

                            {/* Unusual Expense */}
                            {insights.unusualExpense && (
                                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <AlertCircle size={20} className="text-yellow-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800">Unusual Expense Detected</span>
                                    </div>
                                    <p className="text-gray-700">
                                        ✔ <span className="font-medium">{insights.unusualExpense.description}</span> - ${insights.unusualExpense.amount.toFixed(2)} ({insights.unusualExpense.category})
                                    </p>
                                </div>
                            )}

                            {/* Monthly Summary */}
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <span className="text-xl">💡</span>
                                    </div>
                                    <span className="font-semibold text-gray-800">Monthly Summary</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    {insights.monthlySummary}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInsightsModal;
