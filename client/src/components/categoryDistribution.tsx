import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { name: string; percentage: number } }>;
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
                <p className="text-[#1e293b]/60">{data.percentage.toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

interface CategoryDistributionProps {
    refreshTrigger?: number;
}

const CategoryDistribution = ({ refreshTrigger = 0 }: CategoryDistributionProps) => {
    const [data, setData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setLoading(true);
                const month = selectedMonth.getMonth();
                const year = selectedMonth.getFullYear();
                
                const response = await api.get(`/dashboard/summary?month=${month}&year=${year}`);
                const categoryDistribution = response.data.data.categoryDistribution;

                // Convert to chart format
                const totalAmount = categoryDistribution.reduce((sum: number, cat: any) => sum + cat.total, 0);
                const chartData = categoryDistribution
                    .map((cat: any, index: number) => ({
                        name: cat.category,
                        value: parseFloat(cat.total.toFixed(2)),
                        percentage: totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0,
                        color: COLORS[index % COLORS.length],
                    }))
                    .sort((a: CategoryData, b: CategoryData) => b.value - a.value);

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
    }, [selectedMonth, refreshTrigger]);

    const handlePreviousMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    };

    const monthName = selectedMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const currentDate = new Date();
    const isCurrentMonth = selectedMonth.getMonth() === currentDate.getMonth() && 
                          selectedMonth.getFullYear() === currentDate.getFullYear();

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
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-base-content">Category Distribution</h2>
                        <p className="text-sm text-base-content mt-0.5">Spending by category</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousMonth}
                            className="btn btn-ghost btn-sm btn-circle"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-semibold text-base-content min-w-[120px] text-center">
                            {monthName}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="btn btn-ghost btn-sm btn-circle"
                            disabled={isCurrentMonth}
                        > 
                            <ChevronRight size={18} />
                        </button> 
                       
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
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
                            <span className="text-base-content/50">({entry.percentage.toFixed(1)}%)</span>
                        </div>
                    ))}
                    </div>
                </div>
        );
};

export default CategoryDistribution;
