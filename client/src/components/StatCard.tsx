import { useEffect, useState } from "react";
import { Wallet, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import api from "../api/axios";

interface DashboardSummary {
    totalExpense: number;
    averageExpense: number;
    highestExpense: number;
    numberOfTransactions: number;
    categoryDistribution: Array<{category: string; total: number}>;
    month: number;
    year: number;
}

//formatting utility
const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const gradientMap = {
    blue: "stat-card-blue",
    purple: "stat-card-purple",
    pink: "stat-card-pink",
    orange: "stat-card-orange",
};

interface StatCardItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
  gradient: keyof typeof gradientMap;
}

const StatCardItem = ({ icon, value, label, sublabel, gradient }: StatCardItemProps) => (
  <div className={`${gradientMap[gradient]} p-6 rounded-lg text-white shadow-md`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium opacity-90">{label}</h3>
      {icon}
    </div>
    <p className="text-2xl font-bold mb-1">{value}</p>
    <p className="text-xs opacity-75">{sublabel}</p>
  </div>
);

interface StatCardProps {
    refreshTrigger?: number;
}

const StatCard = ({ refreshTrigger = 0 }: StatCardProps) => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try{
                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();
                
                const response = await api.get(`/dashboard/summary?month=${month}&year=${year}`);
                setSummary(response.data.data);
                setError(null);
            }catch(err: any){
                setError("Failed to load dashboard data");
                console.error("Error fetching dashboard summary:", err);
            }finally{
                setLoading(false);
            }
        };
        fetchDashboardSummary();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                Loading stat card...
            </div>);
    }

    if (error || !summary) {
        return (
            <div className="h-[300px] flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7 animate-fade-in">
            <StatCardItem icon={<Wallet size={18} />} value={fmt(summary.totalExpense)} label="Total Spent" sublabel="This month" gradient="blue" />
            <StatCardItem icon={<ShoppingCart size={18} />} value={String(summary.numberOfTransactions)} label="Expenses" sublabel={`${summary.numberOfTransactions} transaction${summary.numberOfTransactions !== 1 ? "s" : ""}`} gradient="purple" />
            <StatCardItem icon={<TrendingUp size={18} />} value={fmt(summary.averageExpense)} label="Average" sublabel="Per expense" gradient="pink" />
            <StatCardItem icon={<DollarSign size={18} />} value={fmt(summary.highestExpense)} label="Highest" sublabel="Single expense" gradient="orange" />
        </div>
    );
};

export default StatCard;