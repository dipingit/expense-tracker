import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { getCategoryIcon, getCategoryColor } from "../constants/categoryIcons";
import { Edit2, Trash2 } from "lucide-react";

interface Expense{
    id: number,
    amount: number,
    description: string,
    category:{name: string, id?: number},
    createdAt?: string 
}

interface Category {
    id: number,
    name: string
}

interface TransactionListProps {
    refreshTrigger?: number;
}

const TransactionList = ({ refreshTrigger = 0 }: TransactionListProps) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ description: '', amount: '', categoryId: 0 });
    
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
        const fetchExpensesAndCategories = async() => {
            try{
                const [expensesRes, categoriesRes] = await Promise.all([
                    api.get('/expenses'),
                    api.get('/categories')
                ]);
                setExpenses(expensesRes.data.data);
                setCategories(categoriesRes.data.data);
            }catch(error: any){
                setError(error?.response?.data?.message || 'Failed to fetch data');
            }finally{
                setLoading(false);
            }
        }
        fetchExpensesAndCategories();
    }, [refreshTrigger]);

    const handleDelete = async(id: number) => {
        if(window.confirm('Are you sure you want to delete this expense?')){
            try{
                await api.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(exp => exp.id !== id));
            }catch(error: any){
                setError(error?.response?.data?.message || 'Failed to delete expense');
            }
        }
    };

    const handleEditStart = (expense: Expense) => {
        setEditingId(expense.id);
        setEditForm({ 
            description: expense.description, 
            amount: String(expense.amount),
            categoryId: expense.category.id || 0
        });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditForm({ description: '', amount: '', categoryId: 0 });
    };

    const handleEditSave = async(id: number) => {
        if(!editForm.description.trim() || !editForm.amount.trim() || editForm.categoryId === 0){
            setError('Please fill in all fields');
            return;
        }
        try{
            const response = await api.patch(`/expenses/${id}`, {
                description: editForm.description,
                amount: Number(editForm.amount),
                categoryId: editForm.categoryId
            });
            setExpenses(expenses.map(exp => 
                exp.id === id ? { ...exp, ...response.data.data } : exp
            ));
            setEditingId(null);
            setEditForm({ description: '', amount: '', categoryId: 0 });
        }catch(error: any){
            setError(error?.response?.data?.message || 'Failed to update expense');
        }
    };

    if(loading) return <p className="p-4">Loading your expenses...</p>
    if(error) return <p className="p-4">{error}</p>

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] mb-24">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#1e293b]">Transactions</h2>
                    <p className="text-xs text-[#1e293b]">{expenses.length} total</p>
                </div>
                <div className="flex items-center">
                    <div className="badge badge-neutral badge-lg font-bold px-4 py-3 text-sm">
                        {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} total: ${monthlyTotal.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
                {expenses.map((item) => {
                    const IconComponent = getCategoryIcon(item.category.name);
                    const iconColor = getCategoryColor(item.category.name);
                    const isEditing = editingId === item.id;

                    return (
                    <div key={item.id} className="flex items-center justify-between py-4">
                        {/* LEFT SIDE: Icon + Details */}
                        <div className="flex items-center gap-3 flex-1">
                            {/* Icon Box */}
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${iconColor}15` }}
                            >
                                <IconComponent size={16} color={iconColor} strokeWidth={2} />
                            </div>
                            {/* transaction details */}
                            {isEditing ? (
                                <div className="flex flex-col gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        placeholder="Description"
                                        className="input input-sm input-bordered"
                                    />
                                    <input
                                        type="number"
                                        value={editForm.amount}
                                        onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                        placeholder="Amount"
                                        className="input input-sm input-bordered"
                                        step="0.01"
                                    />
                                    <select
                                        value={editForm.categoryId}
                                        onChange={(e) => setEditForm({...editForm, categoryId: Number(e.target.value)})}
                                        className="select select-sm select-bordered"
                                    >
                                        <option value={0}>Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-sm text-[#1e293b]">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="badge badge-sm badge-outline text-[10px] py-2">{item.category.name}</span>
                                        <span className="text-[11px] text-[#1e293b]/60">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* right side */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={() => handleEditSave(item.id)}
                                        className="btn btn-sm btn-success text-white"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={handleEditCancel}
                                        className="btn btn-sm btn-ghost"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold text-sm text-[#1e293b]">${item.amount}</span>
                                    <button 
                                        onClick={() => handleEditStart(item)}
                                        className="btn btn-ghost btn-xs btn-circle text-[#1e293b]/30 hover:text-blue-500"
                                        title="Edit expense"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="btn btn-ghost btn-xs btn-circle text-[#1e293b]/30 hover:text-red-500"
                                        title="Delete expense"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionList;
