import { useState } from "react";
import {Plus} from 'lucide-react';
import AddExpenseModal from "./AddExpenseModal";

const Navbar = () => {
    const [IsModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-base-content tracking-tight">Expense Tracker</h1>
                    <p className="text-base-content/50 text-sm mt-1">Manage your finances with ease</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary gap-2 rounded-xl shadow-md"
                        style={{ boxShadow: "var(--shadow-stat)" }}
                    >
                        <Plus size={16} />
                        Add Expense
                    </button>
                </div>
            </div>
            <AddExpenseModal 
                isOpen={IsModalOpen} 
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Navbar;