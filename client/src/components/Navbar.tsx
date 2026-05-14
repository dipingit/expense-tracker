import { useState } from "react";
import { Plus, LogOut, User as UserIcon, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import AddExpenseModal from "./AddExpenseModal";
import AIInsightsModal from "./AIInsightsModal";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

interface NavbarProps {
  onExpenseAdded?: () => void;
}

const Navbar = ({ onExpenseAdded }: NavbarProps) => {
    const [IsModalOpen, setIsModalOpen] = useState(false);
    const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleExpenseAdded = () => {
      onExpenseAdded?.();
    };

    const handleLogout = async () => {
      try {
        await logout();
        toast.success("Logged out successfully!");
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to logout");
      }
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
                        onClick={() => setIsAIInsightsOpen(true)}
                        className="btn btn-outline gap-2 rounded-xl shadow-md"
                        style={{ boxShadow: "var(--shadow-stat)" }}
                    >
                        <Lightbulb size={16} />
                        AI Insights
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary gap-2 rounded-xl shadow-md"
                        style={{ boxShadow: "var(--shadow-stat)" }}
                    >
                        <Plus size={16} />
                        Add Expense
                    </button>
                    
                    {/* User Profile Dropdown */}
                    <div className="dropdown dropdown-end">
                      <button
                        className="btn btn-ghost btn-circle avatar"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      >
                        <div className="w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </button>
                      {isProfileMenuOpen && (
                        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li className="menu-title">
                            <span className="text-sm">{user?.email}</span>
                          </li>
                          <li>
                            <Link to="/profile" className="gap-2">
                              <UserIcon size={16} />
                              View Profile
                            </Link>
                          </li>
                          <li>
                            <button onClick={handleLogout} className="gap-2 text-red-500">
                              <LogOut size={16} />
                              Logout
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                </div>
            </div>
            <AddExpenseModal 
                isOpen={IsModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onExpenseAdded={handleExpenseAdded}
            />
            <AIInsightsModal
                isOpen={isAIInsightsOpen}
                onClose={() => setIsAIInsightsOpen(false)}
            />
        </div>
    );
};

export default Navbar;