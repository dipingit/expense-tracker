import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

interface Expense {
    amount: number;
    categoryId: number;
    category: {
        id: number;
        name: string;
    };
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { name: string } }>;
}

// Color palette for pie slices
const COLORS = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
];

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const { value, payload: data } = payload[0];
        return (
            <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-2 shadow-lg text-sm">
                <p className="font-semibold text-[#1e293b]">{data.name}</p>
                <p className="text-[#6366f1] font-bold">${value.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const CategoryDistribution = () => {
    const [data, setData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setLoading(true);
                const response = await api.get("/expenses");
                const expenses: Expense[] = response.data.data;

                // Aggregate by category
                const categoryTotals: Record<string, number> = {};

                expenses.forEach((expense) => {
                    const categoryName = expense.category.name;
                    if (categoryTotals[categoryName]) {
                        categoryTotals[categoryName] += expense.amount;
                    } else {
                        categoryTotals[categoryName] = expense.amount;
                    }
                });

                // Convert to chart format and sort by value descending
                const chartData = Object.entries(categoryTotals)
                    .map(([name, value], index) => ({
                        name,
                        value: parseFloat(value.toFixed(2)),
                        color: COLORS[index % COLORS.length],
                    }))
                    .sort((a, b) => b.value - a.value);

                setData(chartData);
                setError(null);
            } catch (err: any) {
                setError("Failed to load category data");
                console.error("Error fetching expenses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, []);

    if(loading) { return (
            <div className="h-[300px] flex items-center justify-center">
                Loading chart...
            </div> ); }

    if(error) { return (
            <div className="h-[300px] flex items-center justify-center text-red-500">
                {error}
            </div>
        ); }
    return(
            <div className="card bg-base-100 shadow-md rounded-2xl p-6 h-full">
                <h2 className="text-lg font-bold text-base-content">Category Distribution</h2>
                <p className="text-sm text-base-content/50 mt-0.5 mb-4">Spending by category</p>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-3">
                    {data.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-base-content font-medium">{entry.name}</span>
                            <span className="ml-auto text-base-content/60 font-semibold">${entry.value.toFixed(2)}</span>
                        </div>
                    ))}
                    </div>
                </div>
        );
};

export default CategoryDistribution;
