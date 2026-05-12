import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
}

interface Category {
  id: number;
  name: string;
}

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
      if (response.data.data.length > 0) {
        setCategoryId(response.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || !categoryId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/expenses", {
        description: description.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId,
      });

      // Show success toast
      toast.success("Expense Added Successfully!");

      // Reset form
      setDescription("");
      setAmount("");
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      
      // Notify parent to refresh data
      onExpenseAdded?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box rounded-2xl max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-base-content">Add Expense</h3>
            <button 
              className="btn btn-ghost btn-sm btn-circle" 
              onClick={onClose}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery run"
                className="input input-bordered w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Amount ($)</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="input input-bordered w-full"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="select select-bordered w-full"
                disabled={loading || categories.length === 0}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action mt-2">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
        {/* Backdrop */}
        <div className="modal-backdrop" onClick={onClose} />
      </dialog>
    </>
  );
};

export default AddExpenseModal;
