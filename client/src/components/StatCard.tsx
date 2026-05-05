import { useEffect, useMemo, useState } from "react";
import { Wallet, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import api from "../api/axios";

interface Expense {
    amount: number,
    createdAt: string,  
}
//formatting utility
const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const gradientMap = {
  blue: "bg-[#3B82F6]",
  purple: "bg-[#8B5CF6]",
  pink: "bg-[#EC4899]",
  orange: "bg-[#F97316]",
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
    const [transactions, setTransactions] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchStatData = async () => {
            try{
                const response = await api.get('/expenses');
                const expenseData: Expense[] = response.data.data;
                setTransactions(expenseData);
                setError(null);
            }catch(err: any){
                setError("Failed to load category data");
                console.error("Error fetching expenses:", err);
            }finally{
                setLoading(false);
            }
        };
        fetchStatData();
    }, [refreshTrigger]);

    const getMonthlyExpenses = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return transactions.filter(expense => {
            const expenseDate = new Date(expense.createdAt || '');
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
    };

    const monthlyExpenses = useMemo(() => getMonthlyExpenses(), [transactions]);
    const totalSpent = useMemo(() => monthlyExpenses.reduce((sum, t) => sum + t.amount, 0), [monthlyExpenses]);
    const average = useMemo(() => monthlyExpenses.length > 0 ? totalSpent/monthlyExpenses.length : 0, [monthlyExpenses, totalSpent]);
    const highest = useMemo(() => monthlyExpenses.length > 0 ? Math.max(...monthlyExpenses.map((t) => t.amount)) : 0, [monthlyExpenses]);

    if (loading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                Loading stat card...
            </div>);
    }

    if (error) {
        return (
            <div className="h-[300px] flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7 animate-fade-in">
            <StatCardItem icon={<Wallet size={18} />} value={fmt(totalSpent)} label="Total Spent" sublabel="This month" gradient="blue" />
            <StatCardItem icon={<ShoppingCart size={18} />} value={String(monthlyExpenses.length)} label="Expenses" sublabel={`${monthlyExpenses.length} transaction${monthlyExpenses.length !== 1 ? "s" : ""}`} gradient="purple" />
            <StatCardItem icon={<TrendingUp size={18} />} value={fmt(average)} label="Average" sublabel="Per expense" gradient="pink" />
            <StatCardItem icon={<DollarSign size={18} />} value={fmt(highest)} label="Highest" sublabel="Single expense" gradient="orange" />
        </div>
    );
};

export default StatCard;