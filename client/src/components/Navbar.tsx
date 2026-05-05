import { useState } from "react";
import {Plus} from 'lucide-react';
import AddExpenseModal from "./AddExpenseModal";

interface NavbarProps {
  onExpenseAdded?: () => void;
}

const Navbar = ({ onExpenseAdded }: NavbarProps) => {
    const [IsModalOpen, setIsModalOpen] = useState(false);

    const handleExpenseAdded = () => {
      onExpenseAdded?.();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-base-content tracking-tight">Spendly</h1>
                    <p className="text-base-content text-sm mt-1">Track smarter. Spend better.</p>
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
                onExpenseAdded={handleExpenseAdded}
            />
        </div>
    );
};

export default Navbar;