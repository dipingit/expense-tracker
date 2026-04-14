import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { getCategoryIcon, getCategoryColor } from "../constants/categoryIcons";

interface Expense{
    id: number,
    amount: number,
    description: string,
    category:{name: string},
    createdAt?: string 
}
const TransactionList = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const monthlyTotal = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return expenses.reduce((sum, expense) => {
            const expenseDate = new Date(expense.createdAt || '');
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                return sum + Number(expense.amount);
            }
            return sum;
        }, 0);
    }, [expenses]);
    
    useEffect(() => {
        const fetchExpenses = async() => {
            try{
                const expenses = await api.get('/expenses');
                console.log(expenses);
                setExpenses(expenses.data.data);
            }catch(error: any){
                setError(error.response?.data?.message || 'Failed to fetch expenses' );
            }finally{
                setLoading(false);
            }
        }
        fetchExpenses();
    }, []);

    if(loading) return <p className="p-4">Loading your expenses...</p>
    if(error) return <p className="p-4">{error}</p>

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-24">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Recent Transactions</h2>
                    <p className="text-xs text-[#1e293b]/50">Total List: {expenses.length} items</p>
                </div>
                <div className="flex items-center">
                    <div className="badge badge-neutral badge-lg font-bold px-4 py-3 text-sm">
                        ${monthlyTotal.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
                {expenses.map((item) => {
                    const IconComponent = getCategoryIcon(item.category.name);
                    const iconColor = getCategoryColor(item.category.name);

                    return (
                    <div key={item.id} className="flex items-center justify-between py-4">
                        {/* LEFT SIDE: Icon + Details */}
                        <div className="flex items-center gap-3">
                            {/* Icon Box */}
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${iconColor}15` }}
                            >
                                <IconComponent size={16} color={iconColor} strokeWidth={2} />
                            </div>
                            {/* transaction details */}
                            <div>
                                <p className="font-semibold text-sm text-[#1e293b]">{item.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="badge badge-sm badge-outline text-[10px] py-2">{item.category.name}</span>
                                    <span className="text-[11px] text-[#1e293b]/40">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* right side */}
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-[#1e293b]">${item.amount}</span>
                            <button className="btn btn-ghost btn-xs btn-circle text-[#1e293b]/30 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionList;
