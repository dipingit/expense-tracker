import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

interface Expense {
    amount: number;
    createdAt: string;
}

interface MonthlyData {
    month: string;
    spending: number; 
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

// styled custom Tooltip
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-2 shadow-lg text-sm">
                <p className="font-semibold text-[#1e293b]">{label}</p>
                <p className="text-[#6366f1] font-bold">${(payload[0].value ?? 0).toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

interface MonthlySpendingChartProps {
    refreshTrigger?: number;
}

const MonthlySpendingChart = ({ refreshTrigger = 0 }: MonthlySpendingChartProps) => {
    const [data, setData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndTransformData = async () => {
            try {
                setLoading(true);
                const response = await api.get("/expenses");
                const expenses: Expense[] = response.data.data;

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const currentYear = new Date().getFullYear();

                // initialize an object to hold the sums
                const monthlyTotals: Record<string, number> = {};
                months.forEach((m) => (monthlyTotals[m] = 0));

                // aggregate Logic
                expenses.forEach((expense) => {
                    const date = new Date(expense.createdAt);
                    if (date.getFullYear() === currentYear) {
                        const monthName = months[date.getMonth()];
                        monthlyTotals[monthName] += Number(expense.amount);
                    }
                });

                // convert to recharts format(provides array of objects)
                const chartData = months.map((m) => ({
                    month: m,
                    spending: parseFloat(monthlyTotals[m].toFixed(2)),
                }));

                setData(chartData);
            } catch (err: any) {
                setError("Failed to load chart data");
            } finally {
                setLoading(false);
            }
        };

        fetchAndTransformData();
    }, [refreshTrigger]);

    if (loading) return <div className="h-[300px] flex items-center justify-center">Loading Chart...</div>;
    if (error) return <div className="h-[300px] flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="card bg-white shadow-sm border border-[#e2e8f0] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1e293b]">Monthly Spending</h2>
            <p className="text-sm text-[#1e293b]/50 mt-0.5 mb-6">Current year trend</p>

            <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="spending"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#spendingGradient)"
                        dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlySpendingChart;